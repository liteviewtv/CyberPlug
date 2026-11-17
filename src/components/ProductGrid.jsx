import { AnimatePresence, motion } from 'framer-motion'
import { PackageSearch } from 'lucide-react'
import ProductCard from './ProductCard'

export default function ProductGrid({ products, onAddToCart, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="aspect-[1.16/1] animate-pulse bg-slate-100" />
            <div className="space-y-3 p-5"><div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" /><div className="h-3 w-full animate-pulse rounded bg-slate-100" /><div className="h-9 animate-pulse rounded bg-slate-100" /></div>
          </div>
        ))}
      </div>
    )
  }

  if (!products.length) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex min-h-[340px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/70 px-6 text-center">
        <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400"><PackageSearch size={25} /></span>
        <h3 className="font-display text-lg font-bold text-slate-900">No CyberPlug products found.</h3>
        <p className="mt-1 max-w-xs text-sm text-slate-500">Try another search or clear your filters to find what you need.</p>
      </motion.div>
    )
  }

  return (
    <motion.div layout className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <AnimatePresence mode="popLayout">
        {products.map((product) => <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />)}
      </AnimatePresence>
    </motion.div>
  )
}
