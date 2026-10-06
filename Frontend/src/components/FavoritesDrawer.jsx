import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, X } from 'lucide-react'
import { useFavorites } from '../context/FavoritesContext'
import Button from './ui/Button'

const formatCOP = (value) => `$${Number(value).toLocaleString('es-CO')}`

export default function FavoritesDrawer({ isOpen, onClose, products = [] }) {
  const { favorites, removeFavorite } = useFavorites()
  const navigate = useNavigate()

  const favoriteIds = new Set(favorites.map((id) => String(id)))
  const favoriteProducts = products.filter(
    (product) => product && product.id != null && favoriteIds.has(String(product.id)),
  )

  useEffect(() => {
    if (!isOpen) return undefined
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const handleSelect = (id) => {
    onClose()
    navigate(`/producto/${id}`)
  }

  const handleRemove = (event, id) => {
    event.stopPropagation()
    removeFavorite(id)
  }

  return (
    <div
      className={`fixed inset-0 z-[70] transition-opacity duration-300 ${
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      aria-hidden={!isOpen}
    >
      <div
        className="absolute inset-0 bg-glowe-dark/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Tus favoritos"
        className={`absolute inset-y-0 right-0 flex h-[100dvh] w-full max-w-md flex-col bg-white/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl backdrop-blur-md transition-transform duration-300 sm:p-6 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between pb-4 border-b border-glowe-pink/40">
          <h3 className="font-serif text-lg font-bold text-glowe-dark">
            Tus Favoritos
            {favorites.length > 0 && (
              <span className="ml-2 text-xs font-bold text-glowe-pink-accent">
                ({favorites.length})
              </span>
            )}
          </h3>
          <button
            onClick={onClose}
            aria-label="Cerrar favoritos"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-bold text-glowe-muted hover:bg-glowe-pink/20 hover:text-glowe-dark"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 min-h-0 py-4 space-y-3 overflow-y-auto">
          {favoriteProducts.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Heart className="w-10 h-10 mx-auto text-glowe-pink-accent" aria-hidden="true" />
              <p className="text-xs text-glowe-muted">Aún no tienes productos favoritos.</p>
              <Button
                size="sm"
                onClick={() => {
                  onClose()
                  navigate('/descubrir')
                }}
              >
                Explorar el catálogo
              </Button>
            </div>
          ) : (
            favoriteProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-2 p-2 bg-glowe-offwhite rounded-xl border border-glowe-pink/40"
              >
                <button
                  type="button"
                  onClick={() => handleSelect(product.id)}
                  aria-label={`Ver detalle de ${product.name}`}
                  className="flex-1 flex items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glowe-pink-accent rounded-xl"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-12 h-12 rounded-lg object-cover"
                    loading="lazy"
                  />
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-glowe-dark truncate">{product.name}</h3>
                    <span className="text-xs font-semibold text-glowe-pink-accent">
                      {formatCOP(product.price)}
                    </span>
                  </div>
                </button>
                <Button
                  variant="glass"
                  size="icon"
                  onClick={(event) => handleRemove(event, product.id)}
                  title="Quitar de favoritos"
                  aria-label={`Quitar ${product.name} de favoritos`}
                  className="shrink-0"
                >
                  <Heart className="w-4 h-4" fill="currentColor" />
                </Button>
              </div>
            ))
          )}
        </div>
      </aside>
    </div>
  )
}
