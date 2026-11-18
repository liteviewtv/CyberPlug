import { useEffect, useState } from 'react'
import { Check, ChevronDown, ClipboardList, RefreshCw } from 'lucide-react'

const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(Number(n)||0)
const statuses=['pending','processing','completed','cancelled']
async function request(url,options={}) {
 const response=await fetch(url,{...options,headers:{'Content-Type':'application/json',...(options.headers||{})}})
 const data=await response.json().catch(()=>({}))
 if(!response.ok)throw new Error(data.error||'Request failed')
 return data
}
export default function AdminOrders(){
 const [orders,setOrders]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState(''),[notice,setNotice]=useState(''),[saving,setSaving]=useState('')
 const load=async()=>{setError('');try{const data=await request('/api/orders');setOrders(data.orders||[])}catch(e){setError(e.message)}finally{setLoading(false)}}
 useEffect(()=>{load()},[])
 const changeStatus=async(order,status)=>{setSaving(order.id);setError('');setNotice('');try{await request('/api/orders',{method:'PATCH',body:JSON.stringify({id:order.id,status})});setOrders(current=>current.map(item=>item.id===order.id?{...item,status}:item));setNotice('Order status updated.')}catch(e){setError(e.message)}finally{setSaving('')}}
 return <section className="mt-12">
  <div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-blue-600">Customer purchases</p><h2 className="mt-2 flex items-center gap-2 text-2xl font-bold text-slate-950"><ClipboardList size={23}/> Orders</h2><p className="mt-1 text-sm text-slate-500">Review customer emails, purchased items and update order progress.</p></div><button onClick={load} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600"><RefreshCw className="mr-2 inline" size={15}/>Refresh</button></div>
  {notice&&<p className="mb-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700"><Check className="mr-2 inline" size={15}/>{notice}</p>}
  {error&&<p className="mb-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
  {loading?<div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Loading orders…</div>:orders.length===0?<div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">No orders yet. Customer orders will appear here.</div>:<div className="space-y-4">{orders.map(order=><article key={order.id} className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
   <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-bold text-slate-950">{order.order_number}</p><p className="mt-1 text-xs font-bold uppercase tracking-wide text-amber-700">Payment: {order.payment_status||"unpaid"}</p>{order.payment_track_id&&<p className="mt-1 break-all text-[11px] text-slate-400">OxaPay: {order.payment_track_id}</p>}<p className="mt-1 break-all text-sm text-blue-700">{order.email}</p><p className="mt-1 text-xs text-slate-400">{new Date(order.created_at+'Z').toLocaleString()}</p></div><div className="text-right"><p className="text-lg font-bold text-slate-950">{money(order.total)}</p><label className="mt-2 flex items-center gap-2 text-xs font-semibold text-slate-500">Status <span className="relative"><select value={order.status} disabled={saving===order.id} onChange={e=>changeStatus(order,e.target.value)} className="appearance-none rounded-lg border border-slate-200 bg-slate-50 py-2 pl-3 pr-8 text-xs font-bold capitalize text-slate-800 disabled:opacity-50">{statuses.map(status=><option key={status} value={status}>{status}</option>)}</select><ChevronDown size={13} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2"/></span></label></div></div>
   <div className="mt-4 border-t border-slate-100 pt-3"><p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">Items ordered</p><div className="space-y-2">{(order.items||[]).map(item=><div key={item.id} className="flex items-center gap-3 text-sm">{item.product_image?<img src={item.product_image} alt="" className="h-10 w-10 rounded-lg bg-slate-100 object-cover"/>:<div className="h-10 w-10 rounded-lg bg-slate-100"/>}<div className="min-w-0 flex-1"><p className="truncate font-semibold text-slate-800">{item.product_name}</p><p className="text-xs text-slate-500">Qty: {item.quantity}</p>{item.option_title&&<p className="text-xs font-semibold text-blue-700">{item.option_title}</p>}{item.option_description&&<p className="text-xs text-slate-500">{item.option_description}</p>}</div><span className="font-semibold text-slate-700">{money(item.line_total)}</span></div>)}</div></div>
  </article>)}</div>}
 </section>
}
