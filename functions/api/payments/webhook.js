const json=(body,status=200)=>new Response(body,{status,headers:{'Content-Type':'text/plain','Cache-Control':'no-store'}})
const hex=bytes=>Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('')
async function sign(raw,key){
 const cryptoKey=await crypto.subtle.importKey('raw',new TextEncoder().encode(key),{name:'HMAC',hash:'SHA-512'},false,['sign'])
 return hex(await crypto.subtle.sign('HMAC',cryptoKey,new TextEncoder().encode(raw)))
}
function safeEqual(a,b){
 if(typeof a!=='string'||typeof b!=='string'||a.length!==b.length)return false
 let diff=0;for(let i=0;i<a.length;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);return diff===0
}
export async function onRequestPost({request,env}){
 if(!env.DB||!env.OXAPAY_API_KEY)return json('not configured',503)
 const raw=await request.text(),provided=request.headers.get('HMAC')||request.headers.get('hmac')||''
 let data
 try{data=JSON.parse(raw)}catch{return json('invalid json',400)}
 if(!safeEqual(await sign(raw,env.OXAPAY_API_KEY),provided))return json('invalid signature',401)
 if(data?.type!=='invoice'||!data?.order_id||!data?.track_id)return json('ignored',200)
 const order=await env.DB.prepare('SELECT * FROM orders WHERE id=?').bind(String(data.order_id)).first()
 if(!order||order.payment_provider!=='oxapay'||String(order.payment_track_id)!==String(data.track_id))return json('order mismatch',400)
 const status=String(data.status||'').toLowerCase()
 if(status==='paid'){
  const paidAmount=Number(data.amount)
  if(!Number.isFinite(paidAmount)||paidAmount+0.000001<Number(order.total))return json('amount mismatch',400)
  await env.DB.prepare("UPDATE orders SET payment_status='paid',updated_at=CURRENT_TIMESTAMP WHERE id=? AND payment_status!='paid'").bind(order.id).run()
 }else if(status==='paying'){
  await env.DB.prepare("UPDATE orders SET payment_status='paying',updated_at=CURRENT_TIMESTAMP WHERE id=? AND payment_status!='paid'").bind(order.id).run()
 }else if(status==='expired'||status==='failed'){
  await env.DB.prepare("UPDATE orders SET payment_status=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND payment_status!='paid'").bind(status,order.id).run()
 }
 return json('ok',200)
}
