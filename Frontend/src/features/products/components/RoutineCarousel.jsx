import { useState } from 'react'
import ProductCard from '@/features/products/components/ProductCard'

export default function RoutineCarousel({ items }) {
  const [index, setIndex] = useState(0)
  const visibleItems = items.slice(index, index + 2)

  const canGoPrev = index > 0
  const canGoNext = index + 2 < items.length

  if (!items.length) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="h-px flex-1 bg-white/70" />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIndex((current) => Math.max(0, current - 2))}
            disabled={!canGoPrev}
            aria-label="Ver productos anteriores"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/80 bg-white/75 text-lg text-glowe-dark shadow-sm transition hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => setIndex((current) => Math.min(items.length - 2, current + 2))}
            disabled={!canGoNext}
            aria-label="Ver más productos"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/80 bg-white/75 text-lg text-glowe-dark shadow-sm transition hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40"
          >
            →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {visibleItems.map((product) => (
          <div key={product.id} className="min-w-0">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  )
}
