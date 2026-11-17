import { requireAdmin } from '../_lib/auth'
const fields = ['name','description','price','compare_price','image','category','sku','stock','status','featured','tags']
const clean = (body) => ({
  name: String(body.name || '').trim(), description: String(body.description || '').trim(),
  price: Number(body.price), compare_price: body.compare_price === '' || body.compare_price == null ? null : Number(body.compare_price),
  image: String(body.image || '').trim(), category: String(body.category || 'General').trim(),
  sku: String(body.sku || '').trim(), stock: Math.max(0, Math.floor(Number(body.stock) || 0)),
  status: body.status === 'draft' ? 'draft' : 'active', featured: body.featured ? 1 : 0,
  tags: Array.isArray(body.tags) ? JSON.stringify(body.tags) : JSON.stringify(String(body.tags || '').split(',').map(x => x.trim()).filter(Boolean))
})
export async function onRequestGet({ env }) {
  if (!env.DB) return Response.json({ error: 'Database is not configured.' }, { status: 503 })
  const { results } = await env.DB.prepare('SELECT * FROM products ORDER BY created_at DESC').all()
  return Response.json({ products: results.map(p => ({ ...p, tags: JSON.parse(p.tags || '[]'), featured: !!p.featured })) }, { headers: { 'Cache-Control': 'no-store' } })
}
export async function onRequestPost({ request, env }) {
  if (!await requireAdmin(request, env)) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  if (!env.DB) return Response.json({ error: 'Database is not configured.' }, { status: 503 })
  const p = clean(await request.json())
  if (!p.name || !Number.isFinite(p.price) || p.price < 0) return Response.json({ error: 'Enter a product name and a valid price.' }, { status: 400 })
  const id = crypto.randomUUID()
  await env.DB.prepare('INSERT INTO products (id,name,description,price,compare_price,image,category,sku,stock,status,featured,tags,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)').bind(id,p.name,p.description,p.price,p.compare_price,p.image,p.category,p.sku,p.stock,p.status,p.featured,p.tags).run()
  return Response.json({ id, ok: true }, { status: 201 })
}
