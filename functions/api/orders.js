import { requireAdmin } from '../_lib/auth'
const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}})
const text=v=>String(v||'').trim()
export async function onRequestGet({request,env}) {
 if(!await requireAdmin(request,env))return json({error:'Unauthorized'},401)
 const {results}=await env.DB.prepare('SELECT * FROM orders ORDER BY created_at DESC').all()
 const items=await env.DB.prepare('SELECT * FROM order_items ORDER BY rowid').all()
 const grouped=new Map()
 for(const item of items.results){if(!grouped.has(item.order_id))grouped.set(item.order_id,[]);grouped.get(item.order_id).push(item)}
 return json({orders:results.map(order=>({...order,items:grouped.get(order.id)||[]}))})
}
export async function onRequestPost({request,env}) {
 if(!env.DB)return json({error:'Database is not configured.'},503)
 const body=await request.json().catch(()=>null)
 if(!body)return json({error:'Invalid order details.'},400)
 const email=text(body.email||body.customer?.email).toLowerCase()
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return json({error:'Please enter a valid email address.'},400)
 if(!Array.isArray(body.items)||!body.items.length||body.items.length>50)return json({error:'Your shopping bag is empty or contains too many items.'},400)
 const ids=[...new Set(body.items.map(x=>text(x.id)))]
 if(ids.length!==body.items.length||ids.some(x=>!x))return json({error:'Invalid items in your shopping bag.'},400)
 const placeholders=ids.map(()=>'?').join(',')
 const {results:products}=await env.DB.prepare('SELECT id,name,image,price,stock,status FROM products WHERE id IN ('+placeholders+')').bind(...ids).all()
 const byId=new Map(products.map(p=>[p.id,p])),lines=[]
 for(const item of body.items){
  const product=byId.get(text(item.id)),quantity=Number(item.quantity)
  if(!product||product.status!=='active')return json({error:'One of the products is no longer available. Please refresh your bag.'},409)
  if(!Number.isInteger(quantity)||quantity<1||quantity>99)return json({error:'Invalid product quantity.'},400)
  if(product.stock<quantity)return json({error:'Not enough stock for '+product.name+'. Only '+product.stock+' available.'},409)
  lines.push({...product,quantity,line_total:Number((product.price*quantity).toFixed(2))})
 }
 const subtotal=Number(lines.reduce((sum,line)=>sum+line.line_total,0).toFixed(2))
 const id=crypto.randomUUID()
 const orderNumber='CP-'+new Date().toISOString().slice(0,10).replace(/-/g,'')+'-'+crypto.randomUUID().slice(0,6).toUpperCase()
 const statements=[]
 for(const line of lines)statements.push(env.DB.prepare("UPDATE products SET stock=stock-?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND status='active' AND stock>=?").bind(line.quantity,line.id,line.quantity))
 statements.push(env.DB.prepare("INSERT INTO orders (id,order_number,email,subtotal,total,status) VALUES (?,?,?,?,?,'pending')").bind(id,orderNumber,email,subtotal,subtotal))
 for(const line of lines)statements.push(env.DB.prepare('INSERT INTO order_items (id,order_id,product_id,product_name,product_image,unit_price,quantity,line_total) VALUES (?,?,?,?,?,?,?,?)').bind(crypto.randomUUID(),id,line.id,line.name,line.image,line.price,line.quantity,line.line_total))
 const results=await env.DB.batch(statements)
 const failed=results.slice(0,lines.length).some(result=>result.meta?.changes!==1)
 if(failed){
  await env.DB.prepare('DELETE FROM order_items WHERE order_id=?').bind(id).run()
  await env.DB.prepare('DELETE FROM orders WHERE id=?').bind(id).run()
  for(let i=0;i<lines.length;i++)if(results[i].meta?.changes===1)await env.DB.prepare('UPDATE products SET stock=stock+? WHERE id=?').bind(lines[i].quantity,lines[i].id).run()
  return json({error:'Stock changed while placing your order. Please review your bag and try again.'},409)
 }
 return json({ok:true,order:{id,order_number:orderNumber,email,subtotal,total:subtotal,status:'pending'}},201)
}
