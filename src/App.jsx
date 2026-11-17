import { useEffect, useMemo, useState } from 'react'
import { ArrowDownUp, ArrowRight, Check, ChevronDown, Headphones, ShieldCheck, SlidersHorizontal, Sparkles, Truck } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import Header from './components/Header'
import ProductGrid from './components/ProductGrid'
import { mockProducts } from './data/products'

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

  const categories = useMemo(() => ['All products', ...new Set(products.map((product) => product.category).filter(Boolean))], [products])

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

      <main className="mx-auto max-w-7xl px-4 pb-20 pt-6 sm:px-6 sm:pt-9 lg:px-8">
        <section className="hero-panel relative isolate mb-12 overflow-hidden rounded-[30px] bg-[#080d1c] text-white shadow-[0_24px_70px_rgba(15,23,42,.16)]">
          <div className="hero-glow pointer-events-none absolute -right-24 -top-28 h-[34rem] w-[34rem] rounded-full" />
          <div className="pointer-events-none absolute inset-0 opacity-[.12]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.14) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.14) 1px, transparent 1px)', backgroundSize: '46px 46px', maskImage: 'linear-gradient(90deg, black, transparent 90%)' }} />
          <div className="relative grid min-h-[440px] items-center gap-8 px-6 py-10 sm:px-10 sm:py-12 lg:grid-cols-[1.05fr_.95fr] lg:px-14">
            <div className="relative z-10 max-w-xl">
              <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-300/20 bg-blue-300/10 px-3.5 py-2 text-[10px] font-bold uppercase tracking-[.2em] text-blue-200">
                <Sparkles size={13} /> Your setup, upgraded
              </span>
              <h1 className="font-display text-[2.7rem] font-bold leading-[1.02] tracking-[-.055em] sm:text-6xl lg:text-[4.15rem]">
                Tech that moves<br />you <span className="hero-gradient">forward.</span>
              </h1>
              <p className="mt-5 max-w-md text-sm leading-7 text-slate-300 sm:text-base">
                Discover clever gear, everyday essentials and setup upgrades picked to make every day work better.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a href="#catalog" className="group inline-flex h-12 items-center gap-3 rounded-xl bg-white px-5 text-sm font-bold text-slate-950 transition hover:bg-blue-100">
                  Shop the collection <ArrowRight size={16} className="transition group-hover:translate-x-1" />
                </a>
                <span className="text-xs font-medium text-slate-400">Find your next favourite.</span>
              </div>
              <div className="mt-10 flex items-center gap-5 border-t border-white/10 pt-5">
                <div><p className="font-display text-2xl font-bold">12<span className="text-blue-300">+</span></p><p className="mt-0.5 text-[10px] uppercase tracking-[.16em] text-slate-400">Curated picks</p></div>
                <div className="h-9 w-px bg-white/10" />
                <div><p className="font-display text-2xl font-bold">Made<span className="text-blue-300"> easy</span></p><p className="mt-0.5 text-[10px] uppercase tracking-[.16em] text-slate-400">Better everyday tech</p></div>
              </div>
            </div>
            <div className="relative mx-auto flex w-full max-w-[510px] items-center justify-center lg:min-h-[370px]">
              <div className="hero-orbit absolute h-[330px] w-[330px] rounded-full border border-blue-300/20 sm:h-[390px] sm:w-[390px]" />
              <div className="hero-orbit-two absolute h-[260px] w-[260px] rounded-full border border-white/10 sm:h-[315px] sm:w-[315px]" />
              <div className="relative z-10 w-[78%] rotate-[-5deg] overflow-hidden rounded-[26px] border border-white/15 bg-white/10 p-2 shadow-2xl backdrop-blur-sm">
                <img src="https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=1000&q=90" alt="Premium mechanical keyboard on a desk" className="h-[230px] w-full rounded-[19px] object-cover sm:h-[285px]" />
                <div className="absolute inset-x-2 bottom-2 rounded-b-[19px] bg-gradient-to-t from-slate-950/90 to-transparent px-4 pb-4 pt-12">
                  <span className="text-[9px] font-bold uppercase tracking-[.2em] text-blue-200">Featured gear</span>
                  <p className="mt-1 font-display text-lg font-bold">Build a better setup.</p>
                </div>
              </div>
              <div className="absolute -left-1 top-[12%] z-20 rounded-2xl border border-white/15 bg-slate-900/90 px-4 py-3 shadow-xl backdrop-blur">
                <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-400" /><span className="text-[10px] font-bold uppercase tracking-[.14em] text-slate-200">Good gear only</span></div>
                <p className="mt-1 text-xs text-slate-400">Picked with purpose.</p>
              </div>
              <div className="absolute -bottom-1 right-0 z-20 rounded-2xl border border-blue-300/20 bg-blue-500/20 px-4 py-3 shadow-xl backdrop-blur">
                <p className="text-[9px] font-bold uppercase tracking-[.18em] text-blue-200">The CyberPlug edit</p>
                <p className="mt-1 font-display text-sm font-bold text-white">Small upgrades. Big impact.</p>
              </div>
            </div>
          </div>
        </section>

        <div className="mb-14 grid grid-cols-1 gap-4 border-b border-slate-200 pb-8 sm:grid-cols-3">
          <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-electric"><Truck size={19} /></span><div><p className="text-xs font-bold text-slate-900">Delivery options</p><p className="mt-0.5 text-xs text-slate-500">Convenient ways to get your gear</p></div></div>
          <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-electric"><ShieldCheck size={19} /></span><div><p className="text-xs font-bold text-slate-900">Curated quality</p><p className="mt-0.5 text-xs text-slate-500">Thoughtful picks for daily use</p></div></div>
          <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-electric"><Headphones size={19} /></span><div><p className="text-xs font-bold text-slate-900">Here to help</p><p className="mt-0.5 text-xs text-slate-500">A smoother way to shop tech</p></div></div>
        </div>

        <section id="catalog" className="scroll-mt-28">
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[.2em] text-electric">The CyberPlug edit</p>
              <h2 className="font-display text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Find your next favourite.</h2>
              <p className="mt-1 text-sm text-slate-500">Gear that earns its place in your everyday.</p>
            </div>
            <div className="flex items-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-500 sm:self-auto">
              <SlidersHorizontal size={14} />
              <span>{filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'}</span>
            </div>
          </div>

          <div className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
              {categories.map((item) => (
                <button key={item} type="button" onClick={() => setCategory(item)} className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition ${category === item ? 'bg-slate-950 text-white shadow-sm' : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-950'}`}>
                  {item}
                </button>
              ))}
            </div>
            <label className="flex h-10 shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-500 focus-within:border-slate-400">
              <ArrowDownUp size={14} /><span className="hidden sm:inline">Sort by</span>
              <select value={sort} onChange={(event) => setSort(event.target.value)} className="max-w-[165px] cursor-pointer bg-transparent text-xs font-bold text-slate-800 outline-none">
                <option value="featured">Featured</option><option value="price-asc">Price: Low to High</option><option value="price-desc">Price: High to Low</option><option value="newest">Newest Arrivals</option>
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
        {toast && <motion.div initial={{ opacity: 0, y: 16, scale: .96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12 }} className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-xs font-semibold text-white shadow-2xl"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400 text-slate-950"><Check size={13} /></span>{toast}</motion.div>}
      </AnimatePresence>
    </div>
  )
}
