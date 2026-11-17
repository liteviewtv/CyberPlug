import { ArrowLeft, Check, Package, ShoppingBag } from 'lucide-react'

const money = value => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value) || 0)

export default function ProductDetail({ product, onBack, onAddToCart }) {
  if (!product) return <div className="mx-auto max-w-7xl px-4 py-24 text-center"><p className="text-slate-500">Loading product…</p><button onClick={onBack} className="mt-5 text-sm font-semibold text-electric">Back to store</button></div>
  const outOfStock = Number(product.stock) <= 0
  const tags = Array.isArray(product.tags) ? product.tags : (() => { try { return JSON.parse(product.tags || '[]') } catch { return [] } })()
  return <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    <button onClick={onBack} className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-electric"><ArrowLeft size={17}/> Back to store</button>
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
      <div className="overflow-hidden rounded-3xl bg-slate-100">
        {product.image ? <img src={product.image} alt={product.name} className="aspect-square w-full object-cover" onError={e => { e.currentTarget.style.display = 'none' }} /> : <div className="grid aspect-square place-items-center text-slate-400"><Package size={48}/></div>}
      </div>
      <section className="flex flex-col justify-center py-2">
        <span className="mb-3 text-xs font-bold uppercase tracking-[.18em] text-electric">{product.category || 'General'}</span>
        {product.featured ? <span className="mb-3 w-fit rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-700">Featured product</span> : null}
        <h1 className="font-display text-3xl font-bold leading-tight text-slate-950 sm:text-4xl">{product.name}</h1>
        <div className="mt-5 flex flex-wrap items-center gap-3"><span className="font-display text-2xl font-bold text-slate-950">{money(product.price)}</span>{Number(product.compare_price) > Number(product.price) && <span className="text-base text-slate-400 line-through">{money(product.compare_price)}</span>}</div>
        <div className="mt-5 flex items-center gap-2 text-sm"><span className={outOfStock ? 'text-red-600' : 'text-emerald-700'}>{outOfStock ? 'Out of stock' : 'In stock'}</span>{!outOfStock && <span className="text-slate-400">· {product.stock} available</span>}</div>
        <div className="my-7 border-t border-slate-200"/>
        <h2 className="mb-3 text-sm font-bold text-slate-900">Product description</h2>
        <p className="whitespace-pre-wrap text-sm leading-7 text-slate-600">{product.description || 'No description has been added for this product yet.'}</p>
        {tags.length > 0 && <div className="mt-6 flex flex-wrap gap-2">{tags.map(tag => <span key={tag} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs text-slate-600">{tag}</span>)}</div>}
        <button type="button" disabled={outOfStock} onClick={() => onAddToCart(product)} className="mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-bold text-white transition hover:bg-electric disabled:cursor-not-allowed disabled:bg-slate-300 sm:w-fit sm:min-w-52"><ShoppingBag size={17}/>{outOfStock ? 'Sold out' : 'Add to bag'}</button>
        <p className="mt-4 flex items-center gap-2 text-xs text-slate-400"><Check size={14}/> Secure checkout · Prices shown in USD</p>
      </section>
    </div>
  </main>
}
