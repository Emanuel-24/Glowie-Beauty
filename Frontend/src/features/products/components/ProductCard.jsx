import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '@/features/cart'
import { useFavorites } from '@/features/favorites'
import { useToast } from '@/shared/toast'
import { ChevronLeft, ChevronRight, Heart, Plus } from 'lucide-react'
import Card from '@/shared/components/ui/Card'
import Badge from '@/shared/components/ui/Badge'
import Button from '@/shared/components/ui/Button'

export default function ProductCard({ product }) {
  const { addItem } = useCart()
  const { toggleFavorite, isFavorite } = useFavorites()
  const { showToast } = useToast()
  const [activeImage, setActiveImage] = useState(0)

  const galleryImages = useMemo(() => {
    const unique = [...new Set([product.image, ...(product.images || [])].filter(Boolean))]
    return unique.length > 0 ? unique : [product.image].filter(Boolean)
  }, [product])

  useEffect(() => {
    setActiveImage(0)
  }, [product.id])

  const isFav = isFavorite(product.id)

  const handleFavorite = (e) => {
    e.stopPropagation()
    const added = toggleFavorite(product.id)
    if (added) {
      showToast('¡Guardado en Favoritos! 💖', `${product.name} te esperará aquí.`, '💖')
    } else {
      showToast('Quitado de Favoritos', `${product.name} fue removido.`, '💔')
    }
  }

  const handleAddToCart = (e) => {
    e.stopPropagation()
    addItem(product)
    showToast('¡Agregado al Carrito! 🛒', `${product.name} se añadió a tu pedido.`, '🛍️')
  }

  const showPreviousImage = (event) => {
    event.preventDefault()
    event.stopPropagation()
    setActiveImage((current) => (current - 1 + galleryImages.length) % galleryImages.length)
  }

  const showNextImage = (event) => {
    event.preventDefault()
    event.stopPropagation()
    setActiveImage((current) => (current + 1) % galleryImages.length)
  }

  const detailPath = `/producto/${product.id}`

  return (
    <Card radius="3xl" className="group relative flex h-full flex-col justify-between overflow-hidden border border-white/40 bg-white/70 p-3 shadow-xl backdrop-blur-md sm:p-4">
      <div className="mb-4">
        <Link
          to={detailPath}
          aria-label={`Ver detalle de ${product.name}`}
          className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glowe-pink-accent rounded-2xl"
        >
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-glowe-offwhite">
            <img
              src={galleryImages[activeImage] || product.image}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />

            {galleryImages.length > 1 && (
              <div className="absolute bottom-2.5 inset-x-0 flex justify-center gap-1.5 z-10 pointer-events-none">
                {galleryImages.map((_, idx) => (
                  <span
                    key={idx}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      activeImage === idx
                        ? 'w-4 bg-white shadow-xs'
                        : 'w-1.5 bg-white/60 backdrop-blur-xs'
                    }`}
                  />
                ))}
              </div>
            )}

            {galleryImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={showPreviousImage}
                  aria-label={`Ver imagen anterior de ${product.name}`}
                  className="absolute left-0.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-white/20 text-lg font-bold text-white shadow-lg backdrop-blur-md transition hover:scale-105 hover:bg-white/30"
                >
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={showNextImage}
                  aria-label={`Ver imagen siguiente de ${product.name}`}
                  className="absolute right-0.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-white/20 text-white shadow-lg backdrop-blur-md transition hover:scale-105 hover:bg-white/30"
                >
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </>
            )}

            <Badge tone="white" className="absolute top-3 left-3">
              {product.badge}
            </Badge>
          </div>
        </Link>
      </div>

      <div className="flex flex-1 min-w-0 flex-col">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-glowe-pink-accent">
              {product.category}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-glowe-dark/70 bg-white/80 px-2 py-0.5 rounded-full border border-glowe-pink/20 shadow-xs">
              {product.brand || 'Glowe Select'}
            </span>
          </div>

          <h3 className="font-bold text-glowe-dark text-xs sm:text-sm line-clamp-1 group-hover:text-glowe-pink-accent transition-colors">
            {product.name}
          </h3>
          <p className="line-clamp-2 text-[11px] leading-relaxed text-glowe-muted">
            {product.desc}
          </p>

          {product.tags && product.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {product.tags.slice(0, 3).map((tag) => (
                <span
                  key={`${product.id}-${tag}`}
                  className="rounded-full border border-white/70 bg-white/70 px-2.5 py-1 text-[10px] font-semibold text-glowe-dark/80 shadow-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

        <div className="mt-3 flex items-center justify-between gap-2 border-t border-white/60 pt-3 sm:pt-4">
        <div className="min-w-0">
          <div className={`text-xs text-glowe-muted line-through ${product.oldPrice ? '' : 'hidden'}`}>
            {product.oldPrice ? `$${product.oldPrice.toLocaleString('es-CO')}` : ''}
          </div>
          <div className="text-xs font-bold text-glowe-dark sm:text-base">
            ${product.price.toLocaleString('es-CO')}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <Button
            variant="glass"
            size="icon"
            onClick={handleFavorite}
            title={isFav ? 'Quitar de favoritos' : 'Guardar en favoritos'}
            aria-label="Alternar favorito"
            className="h-11 w-11"
          >
            <span className="sr-only">{isFav ? 'Quitar de favoritos' : 'Guardar en favoritos'}</span>
            <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : 'fill-none'}`} />
          </Button>

          <Button
            variant="soft"
            size="icon"
            onClick={handleAddToCart}
            title="Agregar al Carrito"
            aria-label="Agregar al Carrito"
            className="h-11 w-11"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
