import { requireAdmin } from '../_lib/auth'
const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}})
const text=v=>String(v||'').trim()
export async function onRequestGet({request,env}) {
 if(!await requireAdmin(request,env))return json({error:'Unauthorized'},401)
 const {results}=await env.DB.prepare('SELECT * FROM orders ORDER BY created_at DESC').all(),items=await env.DB.prepare('SELECT * FROM order_items ORDER BY rowid').all(),grouped=new Map()
 for(const item of items.results){if(!grouped.has(item.order_id))grouped.set(item.order_id,[]);grouped.get(item.order_id).push(item)}
 return json({orders:results.map(o=>({...o,items:grouped.get(o.id)||[]}))})
}
export async function onRequestPost({request,env}) {
 if(!env.DB)return json({error:'Database is not configured.'},503)
 const body=await request.json().catch(()=>null);if(!body)return json({error:'Invalid order details.'},400)
 const email=text(body.email).toLowerCase()
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return json({error:'Please enter a valid email address.'},400)
 if(!Array.isArray(body.items)||!body.items.length||body.items.length>50)return json({error:'Your shopping bag is empty or contains too many items.'},400)
 const keys=body.items.map(x=>text(x.id)+'|'+text(x.optionId)),unique=new Set(keys)
 if(unique.size!==keys.length||body.items.some(x=>!text(x.id)))return json({error:'Invalid items in your shopping bag.'},400)
 const ids=[...new Set(body.items.map(x=>text(x.id)))],marks=ids.map(()=>'?').join(','),{results:products}=await env.DB.prepare('SELECT id,name,image,price,stock,status FROM products WHERE id IN ('+marks+')').bind(...ids).all(),byId=new Map(products.map(p=>[p.id,p]))
 const {results:options}=await env.DB.prepare('SELECT * FROM product_options WHERE product_id IN ('+marks+')').bind(...ids).all(),byOption=new Map(options.map(o=>[o.id,o])),lines=[]
 for(const item of body.items){
  const p=byId.get(text(item.id)),q=Number(item.quantity),optionId=text(item.optionId)
  if(!p||p.status!=='active')return json({error:'One of the products is no longer available. Please refresh your bag.'},409)
  if(!Number.isInteger(q)||q<1||q>99)return json({error:'Invalid product quantity.'},400)
  if(optionId){const o=byOption.get(optionId);if(!o||o.product_id!==p.id)return json({error:'A selected product option is no longer available.'},409);if(o.stock<q)return json({error:'Not enough stock for '+o.title+'. Only '+o.stock+' available.'},409);lines.push({...p,option_id:o.id,option_title:o.title,option_description:o.description,unit_price:Number(o.price),quantity:q,line_total:Number((o.price*q).toFixed(2))})}
  else{if(options.some(o=>o.product_id===p.id))return json({error:'Please choose an option for '+p.name+'.'},400);if(p.stock<q)return json({error:'Not enough stock for '+p.name+'. Only '+p.stock+' available.'},409);lines.push({...p,option_id:null,option_title:'',option_description:'',unit_price:Number(p.price),quantity:q,line_total:Number((p.price*q).toFixed(2))})}
 }
 const subtotal=Number(lines.reduce((s,l)=>s+l.line_total,0).toFixed(2)),id=crypto.randomUUID(),orderNumber='CP-'+new Date().toISOString().slice(0,10).replace(/-/g,'')+'-'+crypto.randomUUID().slice(0,6).toUpperCase(),statements=[]
 for(const l of lines)statements.push(l.option_id?env.DB.prepare('UPDATE product_options SET stock=stock-? WHERE id=? AND stock>=?').bind(l.quantity,l.option_id,l.quantity):env.DB.prepare("UPDATE products SET stock=stock-?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND status='active' AND stock>=?").bind(l.quantity,l.id,l.quantity))
 statements.push(env.DB.prepare("INSERT INTO orders (id,order_number,email,subtotal,total,status) VALUES (?,?,?,?,?,'pending')").bind(id,orderNumber,email,subtotal,subtotal))
 for(const l of lines)statements.push(env.DB.prepare('INSERT INTO order_items (id,order_id,product_id,product_name,product_image,unit_price,quantity,line_total,option_id,option_title,option_description) VALUES (?,?,?,?,?,?,?,?,?,?,?)').bind(crypto.randomUUID(),id,l.id,l.name,l.image,l.unit_price,l.quantity,l.line_total,l.option_id,l.option_title,l.option_description))
 const results=await env.DB.batch(statements),failed=results.slice(0,lines.length).some(r=>r.meta?.changes!==1)
 if(failed){await env.DB.prepare('DELETE FROM order_items WHERE order_id=?').bind(id).run();await env.DB.prepare('DELETE FROM orders WHERE id=?').bind(id).run();for(let i=0;i<lines.length;i++)if(results[i].meta?.changes===1){const l=lines[i];if(l.option_id)await env.DB.prepare('UPDATE product_options SET stock=stock+? WHERE id=?').bind(l.quantity,l.option_id).run();else await env.DB.prepare('UPDATE products SET stock=stock+? WHERE id=?').bind(l.quantity,l.id).run()}return json({error:'Stock changed while placing your order. Please review your bag and try again.'},409)}
 return json({ok:true,order:{id,order_number:orderNumber,email,subtotal,total:subtotal,status:'pending'}},201)
}
export async function onRequestPatch({request,env}) {
 if(!await requireAdmin(request,env))return json({error:'Unauthorized'},401)
 const b=await request.json().catch(()=>null),id=text(b?.id),status=text(b?.status)
 if(!id||!['pending','processing','completed','cancelled'].includes(status))return json({error:'Invalid order update.'},400)
 const r=await env.DB.prepare('UPDATE orders SET status=?,updated_at=CURRENT_TIMESTAMP WHERE id=?').bind(status,id).run()
 if(r.meta?.changes!==1)return json({error:'Order not found.'},404);return json({ok:true})
}