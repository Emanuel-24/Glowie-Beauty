import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import ProductCard from './ProductCard'

gsap.registerPlugin(ScrollTrigger)

const categoryPills = [
  { value: 'all', label: 'Todos' },
  { value: 'maquillaje', label: 'Maquillaje' },
  { value: 'cabello', label: 'Cabello' },
]

export default function ProductGrid({ products, glowFilter, onResetFilter, categoryLock = null, title = 'Tus próximos favoritos 💖', subtitle = 'Selección Especial' }) {
  const [category, setCategory] = useState('all')
  const sectionRef = useRef(null)

  const filtered = products.filter((p) => {
    const matchCategory = categoryLock
      ? p.category === categoryLock
      : category === 'all' || p.category === category
    const matchTag = !glowFilter || p.tags.includes(glowFilter.tag)
    return matchCategory && matchTag
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
    <section ref={sectionRef} id="favoritos" className="py-12 relative scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-glowe-pink-accent">
              {subtitle}
            </span>
            <h2 className="font-serif text-3xl font-bold text-glowe-dark">{title}</h2>
          </div>

          {!categoryLock && (
            <div className="hide-scrollbar -mx-1 flex max-w-full items-center gap-2 overflow-x-auto rounded-full border border-white bg-white/60 p-1 shadow-sm sm:mx-0">
              {categoryPills.map((pill) => (
                <button
                  key={pill.value}
                  onClick={() => setCategory(pill.value)}
                  className={`min-h-10 shrink-0 rounded-full px-4 py-1.5 text-xs transition-all ${
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
                className="mt-4 px-4 py-2 bg-glowe-pink-accent text-white font-bold text-xs rounded-full hover:bg-rose-500 transition-colors"
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
