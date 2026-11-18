import { requireAdmin } from '../../_lib/auth'
const clean=b=>[String(b.name||'').trim(),String(b.description||''),Number(b.price),b.compare_price===''||b.compare_price==null?null:Number(b.compare_price),String(b.image||''),String(b.category||'General'),String(b.sku||''),Math.max(0,Math.floor(Number(b.stock)||0)),b.status==='draft'?'draft':'active',b.featured?1:0,JSON.stringify(Array.isArray(b.tags)?b.tags:String(b.tags||'').split(',').map(x=>x.trim()).filter(Boolean))]
const cleanOptions=a=>Array.isArray(a)?a.slice(0,50).map((o,i)=>({id:String(o.id||crypto.randomUUID()),title:String(o.title||'').trim(),description:String(o.description||'').trim(),price:Number(o.price),stock:Math.max(0,Math.floor(Number(o.stock)||0)),sort_order:i})):[]
export async function onRequestPut({request,env,params}) {
 if(!await requireAdmin(request,env))return Response.json({error:'Unauthorized'},{status:401})
 const b=await request.json(),p=clean(b),options=cleanOptions(b.options)
 if(!p[0]||!Number.isFinite(p[2])||p[2]<0)return Response.json({error:'Enter a product name and a valid price.'},{status:400})
 if(options.some(o=>!o.title||!Number.isFinite(o.price)||o.price<0))return Response.json({error:'Each option needs a title and a valid USD price.'},{status:400})
 const statements=[env.DB.prepare('UPDATE products SET name=?,description=?,price=?,compare_price=?,image=?,category=?,sku=?,stock=?,status=?,featured=?,tags=?,updated_at=CURRENT_TIMESTAMP WHERE id=?').bind(...p,params.id),env.DB.prepare('DELETE FROM product_options WHERE product_id=?').bind(params.id)]
 for(const o of options)statements.push(env.DB.prepare('INSERT INTO product_options (id,product_id,title,description,price,stock,sort_order) VALUES (?,?,?,?,?,?,?)').bind(o.id,params.id,o.title,o.description,o.price,o.stock,o.sort_order))
 const r=await env.DB.batch(statements);return Response.json({ok:true,changes:r[0].meta.changes})
}
export async function onRequestDelete({request,env,params}) {
 if(!await requireAdmin(request,env))return Response.json({error:'Unauthorized'},{status:401})
 await env.DB.prepare('DELETE FROM product_options WHERE product_id=?').bind(params.id).run()
 await env.DB.prepare('DELETE FROM products WHERE id=?').bind(params.id).run();return Response.json({ok:true})
}