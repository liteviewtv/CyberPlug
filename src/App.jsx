import { useEffect, useMemo, useState } from 'react'
import { ArrowDownUp, Check, ChevronDown, SlidersHorizontal, Sparkles } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import Header from './components/Header'
import ProductGrid from './components/ProductGrid'
import { mockProducts } from './data/products'

const categories = ['All products', ...new Set(mockProducts.map((product) => product.category))]

export default function App() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [category, setCategory] = useState('All products')
  const [sort, setSort] = useState('featured')
  const [products, setProducts] = useState(mockProducts)
  const [loading, setLoading] = useState(Boolean(import.meta.env.VITE_PRODUCTS_API_URL))
  const [cartCount, setCartCount] = useState(0)
  const [toast, setToast] = useState('')

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim().toLowerCase()), 300)
    return () => window.clearTimeout(timer)
  }, [search])

  // Optional live catalog integration. Set VITE_PRODUCTS_API_URL to an endpoint
  // returning an array of products or { products: [...] }; mock data remains the fallback.
  useEffect(() => {
    const endpoint = import.meta.env.VITE_PRODUCTS_API_URL
    if (!endpoint) return
    const controller = new AbortController()

    async function loadProducts() {
      try {
        const response = await fetch(endpoint, { signal: controller.signal })
        if (!response.ok) throw new Error(`Catalog request failed (${response.status})`)
        const payload = await response.json()
        const items = Array.isArray(payload) ? payload : payload.products
        if (!Array.isArray(items)) throw new Error('The catalog response must be an array or contain a products array.')
        setProducts(items.map((item, index) => ({
          ...item,
          id: String(item.id ?? item._id ?? index),
          title: item.title ?? item.name ?? 'Untitled product',
          price: Number(item.price ?? 0),
          image: item.image ?? item.imageUrl ?? 'https://placehold.co/600x600/f1f5f9/64748b?text=CyberPlug',
          category: item.category ?? 'Other',
          description: item.description ?? '',
          tags: item.tags ?? [],
          createdAt: item.createdAt ?? item.created_at ?? '',
        })))
      } catch (error) {
        if (error.name !== 'AbortError') console.warn('Using the local CyberPlug catalog:', error.message)
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    loadProducts()
    return () => controller.abort()
  }, [])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(''), 2200)
    return () => window.clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    const handleShortcut = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        document.querySelector('input[type="search"]')?.focus()
      }
      if (event.key === 'Escape') setSearch('')
    }
    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [])

  const filteredProducts = useMemo(() => {
    const result = products.filter((product) => {
      const searchable = [product.title, product.description, product.category, ...(Array.isArray(product.tags) ? product.tags : [])]
        .join(' ')
        .toLowerCase()
      const matchesSearch = !debouncedSearch || searchable.includes(debouncedSearch)
      const matchesCategory = category === 'All products' || product.category === category
      return matchesSearch && matchesCategory
    })

    if (sort === 'price-asc') result.sort((a, b) => Number(a.price) - Number(b.price))
    if (sort === 'price-desc') result.sort((a, b) => Number(b.price) - Number(a.price))
    if (sort === 'newest') result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    return result
  }, [products, debouncedSearch, category, sort])

  const addToCart = (product) => {
    setCartCount((count) => count + 1)
    setToast(`${product.title} added to your bag`)
  }

  return (
    <div className="page-shell min-h-screen">
      <Header search={search} setSearch={setSearch} cartCount={cartCount} />

      <main className="mx-auto max-w-7xl px-4 pb-20 pt-9 sm:px-6 sm:pt-12 lg:px-8">
        <section className="relative mb-10 overflow-hidden rounded-[28px] bg-slate-950 px-6 py-9 text-white sm:px-10 sm:py-12">
          <div className="pointer-events-none absolute -right-16 -top-28 h-80 w-80 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-2 -top-12 h-56 w-56 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute bottom-[-120px] right-[20%] h-64 w-64 rounded-full bg-electric/30 blur-[90px]" />
          <div className="relative max-w-2xl">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.2em] text-blue-200">
              <Sparkles size={12} /> The good stuff, plugged in
            </span>
            <h1 className="font-display text-4xl font-bold leading-[1.06] tracking-tight sm:text-5xl">Upgrade your setup.<br /><span className="text-blue-300">Find your next favourite.</span></h1>
            <p className="mt-4 max-w-lg text-sm leading-6 text-slate-300 sm:text-base">Thoughtfully picked tech and everyday essentials built to make your digital life work better.</p>
            <a href="#catalog" className="mt-7 inline-flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-slate-950 transition hover:bg-blue-100">
              Explore the collection <span aria-hidden="true">↗</span>
            </a>
          </div>
          <div className="absolute bottom-8 right-10 hidden rotate-[-9deg] items-center justify-center rounded-3xl border border-white/10 bg-white/[.06] p-5 shadow-2xl backdrop-blur-sm lg:flex">
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-700 shadow-inner"><Sparkles size={42} className="text-white" /></div>
          </div>
        </section>

        <section id="catalog" className="scroll-mt-28">
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[.2em] text-electric">Curated for your setup</p>
              <h2 className="font-display text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Shop the collection</h2>
              <p className="mt-1 text-sm text-slate-500">Find the gear that just gets you.</p>
            </div>
            <div className="flex items-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-500 sm:self-auto">
              <SlidersHorizontal size={14} />
              <span>{filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'}</span>
            </div>
          </div>

          <div className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition ${category === item ? 'bg-slate-950 text-white shadow-sm' : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-950'}`}
                >
                  {item}
                </button>
              ))}
            </div>

            <label className="flex h-10 shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-500 focus-within:border-slate-400">
              <ArrowDownUp size={14} />
              <span className="hidden sm:inline">Sort by</span>
              <select value={sort} onChange={(event) => setSort(event.target.value)} className="max-w-[165px] cursor-pointer bg-transparent text-xs font-bold text-slate-800 outline-none">
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="newest">Newest Arrivals</option>
              </select>
              <ChevronDown size={13} className="pointer-events-none -ml-1 text-slate-400" />
            </label>
          </div>

          <ProductGrid products={filteredProducts} onAddToCart={addToCart} loading={loading} />
        </section>

        <footer className="mt-16 flex flex-col justify-between gap-3 border-t border-slate-200 pt-6 text-xs text-slate-400 sm:flex-row sm:items-center">
          <span className="font-display text-sm font-bold tracking-tight text-slate-700">Cyber<span className="text-electric">Plug</span></span>
          <span>Good gear. Better days. © {new Date().getFullYear()} CyberPlug.</span>
        </footer>
      </main>

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 16, scale: .96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12 }} className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-xs font-semibold text-white shadow-2xl">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400 text-slate-950"><Check size={13} /></span>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
