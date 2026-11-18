const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}})
const text=v=>String(v||'').trim()
export async function onRequestGet({request,env}) {
 if(!env.DB)return json({error:'Database is unavailable.'},503)
 const id=text(new URL(request.url).searchParams.get('order_id'))
 if(!/^[0-9a-f-]{36}$/i.test(id))return json({error:'Invalid order reference.'},400)
 const order=await env.DB.prepare('SELECT order_number,email,total,status,payment_status,created_at FROM orders WHERE id=?').bind(id).first()
 if(!order)return json({error:'Order not found.'},404)
 return json({order:{order_number:order.order_number,email:order.email,total:Number(order.total),status:order.status,payment_status:order.payment_status,created_at:order.created_at}})
}
