import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Search, X } from 'lucide-react'
import ProductCard from './ProductCard'

gsap.registerPlugin(ScrollTrigger)

const categoryPills = [
  { value: 'all', label: 'Todos' },
  { value: 'maquillaje', label: 'Maquillaje' },
  { value: 'cabello', label: 'Cabello' },
]

export default function ProductGrid({
  products,
  glowFilter,
  activeTag = null,
  maquillajeTag = null,
  cabelloTag = null,
  curaduriaTag = null,
  descubrirTag = null,
  searchQuery = '',
  enableSearch = false,
  onSearchChange,
  onClearTag,
  onClearMaquillaje,
  onClearCabello,
  onClearCuraduria,
  onClearDescubrir,
  onClearSearch,
  onResetFilter,
  categoryLock = null,
  title = 'Tus próximos favoritos 💖',
  subtitle = 'Selección Especial',
}) {
  const [category, setCategory] = useState('all')
  const sectionRef = useRef(null)

  const effectiveMaquillaje = maquillajeTag || curaduriaTag || activeTag
  const effectiveDescubrir = descubrirTag || glowFilter?.tag

  const filtered = products.filter((p) => {
    // 1. Filtrar por Categoría
    const matchCategory = categoryLock
      ? p.category === categoryLock
      : category === 'all' || p.category === category

    // 2. Filtrar por Maquillaje (Filtro de Origen)
    let matchMaquillaje = true
    if (effectiveMaquillaje) {
      const searchTag = effectiveMaquillaje.trim().toLowerCase()
      const hasInTags = Array.isArray(p.tags) && p.tags.some((t) => t?.toLowerCase().includes(searchTag))
      const hasInName = p.name?.toLowerCase().includes(searchTag)
      const hasInCategory = p.category?.toLowerCase().includes(searchTag)
      const hasInBrand = p.brand?.toLowerCase().includes(searchTag)
      const hasInDesc = p.desc?.toLowerCase().includes(searchTag)
      matchMaquillaje = hasInTags || hasInName || hasInCategory || hasInBrand || hasInDesc
    }

    // 3. Filtrar por Cabello (Filtro de Origen Capilar)
    let matchCabello = true
    if (cabelloTag) {
      const searchTag = cabelloTag.trim().toLowerCase()
      const hasInTags = Array.isArray(p.tags) && p.tags.some((t) => t?.toLowerCase().includes(searchTag))
      const hasInName = p.name?.toLowerCase().includes(searchTag)
      const hasInCategory = p.category?.toLowerCase().includes(searchTag)
      const hasInBrand = p.brand?.toLowerCase().includes(searchTag)
      const hasInDesc = p.desc?.toLowerCase().includes(searchTag)
      matchCabello = hasInTags || hasInName || hasInCategory || hasInBrand || hasInDesc
    }

    // 4. Filtrar por Descubrir / Glow (Filtro Secundario)
    let matchDescubrir = true
    if (effectiveDescubrir) {
      const searchSubtag = effectiveDescubrir.trim().toLowerCase()
      const hasInTags = Array.isArray(p.tags) && p.tags.some((t) => t?.toLowerCase().includes(searchSubtag))
      const hasInName = p.name?.toLowerCase().includes(searchSubtag)
      const hasInDesc = p.desc?.toLowerCase().includes(searchSubtag)
      matchDescubrir = hasInTags || hasInName || hasInDesc
    }

    // 5. Filtrar por Búsqueda de texto (nombre, marca o tag)
    let matchSearch = true
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase()
      const inName = p.name?.toLowerCase().includes(query)
      const inBrand = p.brand?.toLowerCase().includes(query)
      const inCategory = p.category?.toLowerCase().includes(query)
      const inTags = Array.isArray(p.tags) && p.tags.some((t) => t?.toLowerCase().includes(query))
      const inDesc = p.desc?.toLowerCase().includes(query)
      matchSearch = inName || inBrand || inCategory || inTags || inDesc
    }

    return matchCategory && matchMaquillaje && matchCabello && matchDescubrir && matchSearch
  })

  useEffect(() => {
    if (!sectionRef.current || filtered.length === 0) return undefined

    const ctx = gsap.context(() => {
      const cards = sectionRef.current.querySelectorAll('.product-card-animate')
      gsap.from(cards, {
        y: 28,
        opacity: 0,
        duration: 0.7,
        stagger: 0.08,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 78%',
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [filtered.length])

  return (
    <section ref={sectionRef} id="favoritos" className="pb-12 relative scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-glowe-pink-accent">
              {subtitle}
            </span>
            <h2 className="font-serif text-3xl font-bold text-glowe-dark">{title}</h2>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {enableSearch && (
              <div className="relative min-w-[220px] max-w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-glowe-muted pointer-events-none z-10" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                  placeholder="Buscar por nombre, marca o tag..."
                  aria-label="Buscar productos por nombre, marca o tag"
                  className="w-full rounded-full border border-white/80 bg-white/70 pl-9 pr-8 py-2 text-xs text-glowe-dark placeholder:text-glowe-muted focus:outline-none focus:ring-2 focus:ring-glowe-pink-dark shadow-sm backdrop-blur-sm transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={onClearSearch}
                    aria-label="Limpiar búsqueda"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-glowe-muted hover:text-glowe-dark transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {!categoryLock && (
              <div className="hide-scrollbar -mx-1 flex max-w-full items-center gap-1.5 overflow-x-auto rounded-full border border-white bg-white/60 p-1 shadow-sm sm:mx-0">
                {categoryPills.map((pill) => (
                  <button
                    key={pill.value}
                    onClick={() => setCategory(pill.value)}
                    className={`min-h-9 shrink-0 rounded-full px-4 py-1.5 text-xs transition-all ${
                      category === pill.value
                        ? 'bg-white shadow-sm text-glowe-dark font-bold'
                        : 'font-semibold text-glowe-muted hover:text-glowe-dark'
                    }`}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Indicador Visual de Filtros Activos (Pills con botón X) */}
        {(effectiveMaquillaje || cabelloTag || effectiveDescubrir || searchQuery) && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-glowe-muted mr-1">Filtros activos:</span>
            {effectiveMaquillaje && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 border border-glowe-pink px-3 py-1 text-xs font-bold text-glowe-dark shadow-xs animate-[fadeIn_.2s_ease-out]">
                💄 Maquillaje: <span className="capitalize text-glowe-pink-accent">{effectiveMaquillaje}</span>
                <button
                  type="button"
                  onClick={onClearMaquillaje || onClearCuraduria || onClearTag}
                  aria-label={`Eliminar filtro de Maquillaje ${effectiveMaquillaje}`}
                  className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] text-glowe-dark hover:bg-glowe-pink-dark hover:text-white transition-colors cursor-pointer shadow-xs"
                >
                  <X className="w-3 h-3"/>
                </button>
              </span>
            )}
            {cabelloTag && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 border border-glowe-blue px-3 py-1 text-xs font-bold text-glowe-dark shadow-xs animate-[fadeIn_.2s_ease-out]">
                💇‍♀️ Cabello: <span className="capitalize text-glowe-blue-accent">{cabelloTag}</span>
                <button
                  type="button"
                  onClick={onClearCabello}
                  aria-label={`Eliminar filtro de Cabello ${cabelloTag}`}
                  className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] text-glowe-dark hover:bg-glowe-blue-dark hover:text-white transition-colors cursor-pointer shadow-xs"
                >
                  <X className="w-3 h-3"/>
                </button>
              </span>
            )}
            {glowFilter && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-50 border border-glowe-blue px-3 py-1 text-xs font-bold text-glowe-dark shadow-xs animate-[fadeIn_.2s_ease-out]">
                {glowFilter.icon || '✨'} <span>{glowFilter.label || glowFilter.tag}</span>
                <button
                  type="button"
                  onClick={onClearDescubrir || onResetFilter}
                  aria-label={`Eliminar filtro de descubrir ${glowFilter.label || glowFilter.tag}`}
                  className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] text-glowe-dark hover:bg-glowe-blue-dark hover:text-white transition-colors cursor-pointer shadow-xs"
                >
                  <X className="w-3 h-3"/>
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-300 px-3 py-1 text-xs font-bold text-glowe-dark shadow-xs animate-[fadeIn_.2s_ease-out]">
                🔍 Búsqueda: <span className="text-amber-800">"{searchQuery}"</span>
                <button
                  type="button"
                  onClick={onClearSearch}
                  aria-label="Limpiar término de búsqueda"
                  className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] text-glowe-dark hover:bg-glowe-yellow-accent hover:text-white transition-colors cursor-pointer shadow-xs"
                >
                  <X className="w-3 h-3"/>
                </button>
              </span>
            )}
            <button
              type="button"
              onClick={onResetFilter}
              className="text-[11px] font-semibold text-glowe-pink-accent hover:underline ml-2"
            >
              Limpiar todos
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 min-[440px]:grid-cols-2 sm:gap-6 md:grid-cols-3 xl:grid-cols-4">
          {filtered.length === 0 ? (
            <div className="col-span-full py-12 text-center glass-panel rounded-3xl p-8">
              <span className="text-4xl">🔍</span>
              <h3 className="font-bold text-sm sm:text-base text-glowe-dark mt-2">
                No encontramos productos en esta búsqueda
              </h3>
              <p className="text-xs text-glowe-muted mt-1">
                Prueba seleccionando otra categoría o limpiando los filtros.
              </p>
              <button
                onClick={onResetFilter}
                className="mt-4 px-4 py-2 bg-glowe-pink-accent text-white font-bold text-xs rounded-full hover:bg-rose-500 transition-colors cursor-pointer"
              >
                Ver todos los productos
              </button>
            </div>
          ) : (
            filtered.map((product) => (
              <div key={product.id} className="product-card-animate">
                <ProductCard product={product} />
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  )
}
