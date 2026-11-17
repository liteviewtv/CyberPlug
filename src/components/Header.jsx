import { ShoppingBag, UserRound, Zap } from 'lucide-react'
import SearchBar from './SearchBar'

export default function Header({ search, setSearch, cartCount }) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <a href="#" className="flex shrink-0 items-center gap-2.5" aria-label="CyberPlug home">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-white shadow-sm">
            <Zap size={19} fill="currentColor" strokeWidth={1.8} />
          </span>
          <span className="font-display text-[21px] font-bold tracking-tight text-slate-950">Cyber<span className="text-electric">Plug</span></span>
        </a>

        <div className="mx-auto hidden w-full max-w-xl md:block">
          <SearchBar value={search} onChange={setSearch} />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
          <button type="button" className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 hover:text-slate-950" aria-label={`Shopping bag, ${cartCount} items`}>
            <ShoppingBag size={19} strokeWidth={1.8} />
            {cartCount > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-electric px-1 text-[10px] font-bold text-white">{cartCount}</span>}
          </button>
          <button type="button" className="hidden h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 sm:flex">
            <UserRound size={18} strokeWidth={1.8} />
            <span>Account</span>
          </button>
          <button type="button" aria-label="Account" className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 sm:hidden">
            <UserRound size={19} />
          </button>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 pb-3 sm:px-6 md:hidden lg:px-8">
        <SearchBar value={search} onChange={setSearch} />
      </div>
    </header>
  )
}
