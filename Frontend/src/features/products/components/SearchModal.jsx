import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { useCart } from '@/features/cart'
import { useToast } from '@/shared/toast'
import Button from '@/shared/components/ui/Button'
import { useProductSearch } from '@/features/products/hooks/useProductSearch'

export default function SearchModal({
  isOpen,
  onClose,
  products: initialProducts,
  onGoToDiscover,
}) {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const { addItem } = useCart()
  const { showToast } = useToast()

  const shouldFetch = isOpen && (!initialProducts || initialProducts.length === 0)
  const { products: fetchedProducts } = useProductSearch(shouldFetch)
  const products = initialProducts && initialProducts.length > 0 ? initialProducts : fetchedProducts

  useEffect(() => {
    if (!isOpen) return undefined

    const originalBodyOverflow = document.body.style.overflow
    const originalHtmlOverflow = document.documentElement.style.overflow
    const originalBodyPaddingRight = document.body.style.paddingRight

    // Compensar la desaparición de la barra de scroll para evitar saltos horizontales
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`
    }

    // Congelar completamente el scroll de la página detrás de la sombra
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.()
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = originalBodyOverflow
      document.documentElement.style.overflow = originalHtmlOverflow
      document.body.style.paddingRight = originalBodyPaddingRight
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null
  if (typeof document === 'undefined') return null

  const q = query.trim().toLowerCase()
  const results = q
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.tags || []).some((t) => t.toLowerCase().includes(q)),
      )
    : products.slice(0, 8)

  const goToDetail = (p) => {
    onClose()
    navigate(q ? `/producto/${p.id}?q=${encodeURIComponent(q)}` : `/producto/${p.id}`)
  }

  const handleQuickAdd = (p, e) => {
    e.stopPropagation()
    addItem(p)
    showToast('¡Agregado al Carrito! 🛒', `${p.name} se anadió a tu pedido.`, '🛍️')
    onClose()
  }

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-3 pt-4 sm:px-6 sm:pt-16 overflow-hidden overscroll-none"
      aria-hidden="false"
    >
      {/* Sombra de pantalla completa: bloquea interacción y arrastres sobre el fondo */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-all touch-none select-none"
        aria-hidden="true"
      />

      <div
        className="relative flex max-h-[calc(100dvh-1.5rem)] w-full max-w-3xl flex-col overflow-hidden rounded-[28px] border border-white/60 bg-white/95 shadow-2xl backdrop-blur-xl sm:max-h-[calc(100dvh-4rem)] touch-auto overscroll-contain"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Búsqueda de productos"
      >
        <div className="flex items-center gap-3 border-b border-glowe-pink/30 p-4">
          <Search className="h-5 w-5 text-glowe-pink-accent" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar labiales, serums, kits..."
            className="flex-1 bg-transparent text-sm text-glowe-dark placeholder:text-glowe-muted focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-glowe-muted hover:bg-white/70 hover:text-glowe-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glowe-pink-accent cursor-pointer"
            aria-label="Cerrar búsqueda"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4 overscroll-contain">
          {results.length === 0 ? (
            <div className="space-y-4 py-8 text-center">
              <p className="text-sm text-glowe-muted">No encontramos resultados para “{query}”.</p>
              <Button variant="glass" onClick={() => { onClose(); onGoToDiscover?.(); }}>
                Ver catálogo completo
              </Button>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {results.map((p) => (
                <div
                  key={p.id}
                  className="group relative flex items-center gap-3 rounded-2xl border border-glowe-pink/20 bg-glowe-offwhite/60 p-2 transition hover:border-glowe-pink-accent hover:bg-white"
                >
                  <button
                    type="button"
                    onClick={() => goToDetail(p)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                    aria-label={`Ver detalle de ${p.name}`}
                  >
                    <img src={p.image} alt={p.name} className="h-16 w-16 rounded-xl object-cover" loading="lazy" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-glowe-pink-accent">{p.category}</span>
                        <span className="text-xs font-bold text-glowe-dark">${p.price.toLocaleString('es-CO')}</span>
                      </div>
                      <h3 className="mt-1 truncate text-sm font-bold text-glowe-dark">{p.name}</h3>
                      <p className="mt-1 text-[11px] text-glowe-muted">{p.tags?.[0] || 'Producto favorito'}</p>
                    </div>
                  </button>

                  <Button
                    variant="glass"
                    size="icon"
                    className="relative z-10 h-11 w-11 shrink-0"
                    onClick={(e) => handleQuickAdd(p, e)}
                    aria-label={`Agregar ${p.name} al carrito`}
                  >
                    +
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
