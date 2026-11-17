import { requireAdmin } from '../../_lib/auth'
const clean = (b) => [String(b.name||'').trim(),String(b.description||''),Number(b.price),b.compare_price===''||b.compare_price==null?null:Number(b.compare_price),String(b.image||''),String(b.category||'General'),String(b.sku||''),Math.max(0,Math.floor(Number(b.stock)||0)),b.status==='draft'?'draft':'active',b.featured?1:0,JSON.stringify(Array.isArray(b.tags)?b.tags:String(b.tags||'').split(',').map(x=>x.trim()).filter(Boolean))]
export async function onRequestPut({ request, env, params }) {
  if (!await requireAdmin(request,env)) return Response.json({error:'Unauthorized'},{status:401})
  const b=await request.json(), p=clean(b)
  if(!p[0]||!Number.isFinite(p[2])||p[2]<0) return Response.json({error:'Enter a product name and a valid price.'},{status:400})
  const result=await env.DB.prepare('UPDATE products SET name=?,description=?,price=?,compare_price=?,image=?,category=?,sku=?,stock=?,status=?,featured=?,tags=?,updated_at=CURRENT_TIMESTAMP WHERE id=?').bind(...p,params.id).run()
  return Response.json({ok:true,changes:result.meta.changes})
}
export async function onRequestDelete({ request, env, params }) {
  if(!await requireAdmin(request,env)) return Response.json({error:'Unauthorized'},{status:401})
  await env.DB.prepare('DELETE FROM products WHERE id=?').bind(params.id).run()
  return Response.json({ok:true})
}
