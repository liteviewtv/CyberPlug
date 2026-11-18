import { requireAdmin } from '../_lib/auth'
const clean = body => ({name:String(body.name||'').trim(),description:String(body.description||'').trim(),price:Number(body.price),compare_price:body.compare_price===''||body.compare_price==null?null:Number(body.compare_price),image:String(body.image||'').trim(),category:String(body.category||'General').trim(),sku:String(body.sku||'').trim(),stock:Math.max(0,Math.floor(Number(body.stock)||0)),status:body.status==='draft'?'draft':'active',featured:body.featured?1:0,tags:JSON.stringify(Array.isArray(body.tags)?body.tags:String(body.tags||'').split(',').map(x=>x.trim()).filter(Boolean))})
const cleanOptions = a => Array.isArray(a)?a.slice(0,50).map((o,i)=>({id:String(o.id||crypto.randomUUID()),title:String(o.title||'').trim(),description:String(o.description||'').trim(),price:Number(o.price),stock:Math.max(0,Math.floor(Number(o.stock)||0)),sort_order:i})):[]
export async function onRequestGet({request,env}) {
 if(!env.DB)return Response.json({error:'Database is not configured.'},{status:503})
 const admin=await requireAdmin(request,env)
 const {results}=await env.DB.prepare(admin?'SELECT * FROM products ORDER BY created_at DESC':'SELECT * FROM products WHERE status = ? ORDER BY created_at DESC').bind(...(admin?[]:['active'])).all()
 const ids=results.map(p=>p.id),grouped=new Map()
 if(ids.length){const marks=ids.map(()=>'?').join(',');const {results:opts}=await env.DB.prepare('SELECT * FROM product_options WHERE product_id IN ('+marks+') ORDER BY sort_order,id').bind(...ids).all();for(const o of opts){if(!grouped.has(o.product_id))grouped.set(o.product_id,[]);grouped.get(o.product_id).push(o)}}
 return Response.json({products:results.map(p=>({...p,tags:JSON.parse(p.tags||'[]'),featured:!!p.featured,options:grouped.get(p.id)||[]}))},{headers:{'Cache-Control':'no-store'}})
}
export async function onRequestPost({request,env}) {
 if(!await requireAdmin(request,env))return Response.json({error:'Unauthorized'},{status:401})
 if(!env.DB)return Response.json({error:'Database is not configured.'},{status:503})
 const body=await request.json(),p=clean(body),options=cleanOptions(body.options)
 if(!p.name||!Number.isFinite(p.price)||p.price<0)return Response.json({error:'Enter a product name and a valid price.'},{status:400})
 if(options.some(o=>!o.title||!Number.isFinite(o.price)||o.price<0))return Response.json({error:'Each option needs a title and a valid USD price.'},{status:400})
 const id=crypto.randomUUID(),statements=[env.DB.prepare('INSERT INTO products (id,name,description,price,compare_price,image,category,sku,stock,status,featured,tags,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)').bind(id,p.name,p.description,p.price,p.compare_price,p.image,p.category,p.sku,p.stock,p.status,p.featured,p.tags)]
 for(const o of options)statements.push(env.DB.prepare('INSERT INTO product_options (id,product_id,title,description,price,stock,sort_order) VALUES (?,?,?,?,?,?,?)').bind(o.id,id,o.title,o.description,o.price,o.stock,o.sort_order))
 await env.DB.batch(statements);return Response.json({id,ok:true},{status:201})
}