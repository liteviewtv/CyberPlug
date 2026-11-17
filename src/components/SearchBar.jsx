import { Search, X } from 'lucide-react'

export default function SearchBar({ value, onChange }) {
  return (
    <label className="group flex h-12 w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 transition focus-within:border-slate-400 focus-within:ring-4 focus-within:ring-blue-500/5">
      <Search size={18} className="shrink-0 text-slate-400 transition group-focus-within:text-electric" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search products..."
        aria-label="Search products"
        className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:font-normal placeholder:text-slate-400"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <X size={15} />
        </button>
      )}
      <kbd className="hidden rounded-md border border-slate-200 bg-slate-50 px-1.5 py-1 text-[10px] font-semibold text-slate-400 sm:block">⌘ K</kbd>
    </label>
  )
}
