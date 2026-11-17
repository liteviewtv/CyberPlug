import { motion } from 'framer-motion'
import { ArrowUpRight, ShoppingBag } from 'lucide-react'

const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
})

export default function ProductCard({ product, onAddToCart }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.22 }}
      className="product-card group overflow-hidden rounded-2xl border border-slate-200/80 bg-white transition duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-soft"
    >
      <div className="relative aspect-[1.16/1] overflow-hidden bg-slate-100">
        <img
          src={product.image}
          alt={product.title}
          loading="lazy"
          className="product-image h-full w-full object-cover"
          onError={(event) => { event.currentTarget.src = 'https://placehold.co/600x600/f1f5f9/64748b?text=CyberPlug' }}
        />
        {product.badge && (
          <span className="absolute left-3 top-3 rounded-full border border-white/70 bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.12em] text-slate-700 shadow-sm backdrop-blur">
            {product.badge}
          </span>
        )}
        <span className="absolute bottom-3 right-3 rounded-lg bg-slate-950/80 px-2.5 py-1.5 text-[10px] font-semibold tracking-wide text-white backdrop-blur">
          {product.category}
        </span>
      </div>

      <div className="p-4 sm:p-5">
        <div className="mb-2 flex items-start justify-between gap-3">
          <h3 className="min-h-[44px] flex-1 font-display text-[15px] font-semibold leading-snug tracking-tight text-slate-900">{product.title}</h3>
          <ArrowUpRight size={17} className="mt-0.5 shrink-0 text-slate-300 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-electric" />
        </div>
        <p className="mb-5 line-clamp-2 min-h-[40px] text-xs leading-5 text-slate-500">{product.description}</p>
        <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <span className="font-display text-lg font-bold tracking-tight text-slate-950">{money.format(Number(product.price) || 0)}</span>
          <button
            type="button"
            onClick={() => onAddToCart(product)}
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-slate-950 px-3.5 text-xs font-bold text-white transition hover:bg-electric focus:outline-none focus:ring-4 focus:ring-blue-500/15 active:scale-[.97]"
          >
            <ShoppingBag size={14} />
            Add to bag
          </button>
        </div>
      </div>
    </motion.article>
  )
}
