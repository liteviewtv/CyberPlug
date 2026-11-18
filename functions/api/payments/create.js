import { requireAdmin } from '../../_lib/auth'
const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}})
const text=v=>String(v||'').trim()
export async function onRequestPost({request,env}) {
 if(!env.DB||!env.OXAPAY_API_KEY)return json({error:'Crypto payments are not configured yet.'},503)
 const body=await request.json().catch(()=>null),orderId=text(body?.orderId),email=text(body?.email).toLowerCase()
 if(!orderId||!email)return json({error:'Order details are missing.'},400)
 const order=await env.DB.prepare('SELECT * FROM orders WHERE id=? AND lower(email)=?').bind(orderId,email).first()
 if(!order)return json({error:'Order not found.'},404)
 if(order.payment_status==='paid')return json({error:'This order has already been paid.'},409)
 if(order.payment_track_id&&order.payment_url&&order.payment_status!=='expired'&&order.payment_status!=='failed')return json({paymentUrl:order.payment_url,trackId:order.payment_track_id,orderNumber:order.order_number})
 const origin=new URL(request.url).origin
 const payload={amount:Number(order.total),lifetime:60,fee_paid_by_payer:1,callback_url:origin+'/api/payments/webhook',return_url:origin+'/?payment=return',email:order.email,order_id:order.id,description:'CyberPlug order '+order.order_number,sandbox:true}
 let response,data
 try{
  response=await fetch('https://api.oxapay.com/v1/payment/invoice',{method:'POST',headers:{'merchant_api_key':env.OXAPAY_API_KEY,'Content-Type':'application/json'},body:JSON.stringify(payload)})
  data=await response.json()
 }catch{return json({error:'Could not connect to the payment provider. Please try again.'},502)}
 const paymentUrl=data?.data?.payment_url,trackId=data?.data?.track_id
 if(!response.ok||!paymentUrl||!trackId)return json({error:data?.error?.message||data?.message||'Payment invoice could not be created.'},502)
 await env.DB.prepare("UPDATE orders SET payment_status='paying',payment_provider='oxapay',payment_track_id=?,payment_url=?,updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(String(trackId),String(paymentUrl),order.id).run()
 return json({paymentUrl,trackId:String(trackId),orderNumber:order.order_number})
}
