import { useState } from 'react'
import { ArrowLeft, CheckCircle2, LoaderCircle, LockKeyhole, X } from 'lucide-react'
const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(Number(n)||0)
export default function Checkout({items,onClose,onSuccess}){
 const [email,setEmail]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('')
 const [order,setOrder]=useState(null)
 const subtotal=items.reduce((sum,item)=>sum+Number(item.price)*item.quantity,0)
 const submit=async e=>{
  e.preventDefault();setBusy(true);setError('')
  try{
   let currentOrder=order
   if(!currentOrder){
    const response=await fetch('/api/orders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,items:items.map(item=>({id:item.id,optionId:item.optionId||'',quantity:item.quantity}))})})
    const data=await response.json().catch(()=>({}))
    if(!response.ok)throw new Error(data.error||'We could not place your order. Please try again.')
    currentOrder=data.order;setOrder(currentOrder)
   }
   const paymentResponse=await fetch('/api/payments/create',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({orderId:currentOrder.id,email:currentOrder.email||email})})
   const payment=await paymentResponse.json().catch(()=>({}))
   if(!paymentResponse.ok||!payment.paymentUrl)throw new Error(payment.error||'Your order was created, but the payment page could not be opened. Tap Pay now to retry.')
   onSuccess()
   window.location.assign(payment.paymentUrl)
  }catch(err){setError(err.message)}finally{setBusy(false)}
 }
 return <div className="fixed inset-0 z-[70] overflow-y-auto bg-slate-950/60 p-3 sm:p-6"><div className="mx-auto my-3 max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">
  <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-7"><button onClick={onClose} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600"><ArrowLeft size={17}/> Back to bag</button><button onClick={onClose} aria-label="Close checkout" className="rounded-xl p-2 hover:bg-slate-100"><X size={19}/></button></div>
  <div className="grid gap-8 p-5 sm:p-7 md:grid-cols-[1.2fr_.8fr]"><form onSubmit={submit} className="space-y-5"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-blue-600">Secure crypto checkout</p><h1 className="mt-2 text-2xl font-bold text-slate-950">Email for digital delivery</h1><p className="mt-1 text-sm text-slate-500">Enter your email. You'll be redirected to OxaPay to choose your cryptocurrency and complete payment.</p></div><label className="block text-sm font-semibold text-slate-700">Email address *<input required type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} disabled={!!order} className="input mt-2 disabled:bg-slate-100" placeholder="you@example.com"/></label>{error&&<p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}{order&&<p className="rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800">Order {order.order_number} has been created. Complete payment to confirm it. You can retry opening the payment page below.</p>}<button disabled={busy||items.length===0} className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-4 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60">{busy?<><LoaderCircle className="animate-spin" size={17}/> Preparing payment…</>:<><LockKeyhole size={17}/>{order?'Pay now with crypto':'Continue to crypto payment'}</>}</button><p className="text-center text-xs text-slate-400">Payments are securely processed by OxaPay.</p></form>
  <aside className="h-fit rounded-2xl bg-slate-50 p-5"><h2 className="font-bold text-slate-950">Order summary</h2><div className="mt-4 space-y-3">{items.map(item=><div key={item.cartKey||item.id} className="flex items-start justify-between gap-3 text-sm"><div className="min-w-0"><p className="font-semibold text-slate-800">{item.name}</p>{item.optionTitle&&<p className="text-xs font-semibold text-blue-700">{item.optionTitle}</p>}{item.optionDescription&&<p className="text-xs text-slate-500">{item.optionDescription}</p>}<p className="text-xs text-slate-500">Qty: {item.quantity}</p></div><span className="shrink-0 font-semibold">{money(item.price*item.quantity)}</span></div>)}</div><div className="mt-5 border-t border-slate-200 pt-4"><div className="flex justify-between text-sm text-slate-500"><span>Subtotal</span><span>{money(subtotal)}</span></div><div className="mt-4 flex justify-between text-base font-bold text-slate-950"><span>Total</span><span>{money(subtotal)}</span></div><div className="mt-4 rounded-xl bg-white p-3 text-xs leading-5 text-slate-500">Digital product orders are delivered electronically. No shipping address is needed.</div></div></aside></div>
 </div></div>
}
