import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Orbit } from '@uiball/loaders'
import { Heart } from 'lucide-react'
import { useCart } from '@/features/cart'
import { useFavorites } from '@/features/favorites'
import { useToast } from '@/shared/toast'
import Button from '@/shared/components/ui/Button'
import Card from '@/shared/components/ui/Card'
import { getProducts } from '@/features/products/services/productService'
import { usePageMeta } from '@/shared/hooks/usePageMeta'

const formatCOP = (value) => `$${Number(value || 0).toLocaleString('es-CO')}`

export default function Favoritos() {
  usePageMeta({
    title: 'Mis Favoritos',
    description: 'Tus productos favoritos guardados en GLOWE BEAUTY.',
  })
  const { favorites, removeFavorite } = useFavorites()
  const { addItem } = useCart()
  const { showToast } = useToast()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)

    getProducts()
      .then((items) => {
        if (!active) return
        setProducts(items)
      })
      .catch(() => {
        if (!active) return
        setProducts([])
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const favoriteIds = useMemo(() => new Set(favorites.map((id) => String(id))), [favorites])
  const favoriteProducts = products.filter(
    (product) => product && product.id != null && favoriteIds.has(String(product.id)),
  )

  const handleAddToCart = (product) => {
    addItem(product)
    showToast('¡Agregado al Carrito! 🛒', `${product.name} se añadió a tu pedido.`, '🛍️')
  }

  const handleRemove = (productId) => {
    removeFavorite(productId)
    showToast('Quitado de Favoritos', 'Este producto ya no está en tu lista.', '💔')
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] px-4 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="flex min-h-[30vh] items-center justify-center">
            <div className="flex flex-col items-center gap-3 rounded-[2rem] border border-white/70 bg-white/70 px-8 py-6 shadow-xl backdrop-blur-md">
              <Orbit size={34} color="#ff758f" speed={1.4} />
              <span className="text-sm font-semibold text-glowe-muted">Cargando tus favoritos...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-glowe-pink-accent">Tu wishlist</p>
            <h1 className="mt-2 font-serif text-3xl font-bold text-glowe-dark sm:text-4xl">Favoritos</h1>
          </div>
          <Button variant="glass" onClick={() => window.history.back()}>
            Volver
          </Button>
        </div>

        {favoriteProducts.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-glowe-pink-soft text-glowe-pink-accent">
              <Heart className="h-8 w-8" fill="currentColor" aria-hidden="true" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-glowe-dark">Todavía no tienes favoritos</h2>
            <p className="mt-2 text-sm text-glowe-muted">Guarda tus productos preferidos y vuelve aquí cuando quieras.</p>
            <div className="mt-6 flex justify-center">
              <Link to="/descubrir">
                <Button variant="gradient">Explorar el catálogo</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4 min-[520px]:grid-cols-2 sm:gap-5 xl:grid-cols-3">
            {favoriteProducts.map((product) => (
              <Card key={product.id} radius="3xl" className="overflow-hidden p-3">
                <Link to={`/producto/${product.id}`} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glowe-pink-accent rounded-2xl">
                  <div className="overflow-hidden rounded-2xl bg-glowe-offwhite">
                    <img src={product.image} alt={product.name} className="aspect-square w-full object-cover transition-transform duration-500 hover:scale-105" loading="lazy" />
                  </div>
                </Link>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-glowe-pink-accent">
                      {product.category}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemove(product.id)}
                      className="text-glowe-muted hover:text-glowe-pink-accent"
                      aria-label={`Quitar ${product.name} de favoritos`}
                    >
                      <Heart className="h-4 w-4" fill="currentColor" aria-hidden="true" />
                    </button>
                  </div>

                  <Link to={`/producto/${product.id}`} className="block">
                    <h3 className="text-base font-bold text-glowe-dark transition-colors hover:text-glowe-pink-accent">
                      {product.name}
                    </h3>
                  </Link>

                  <p className="text-sm text-glowe-muted">{product.desc}</p>

                  <div className="flex items-center justify-between gap-3 pt-2">
                    <div>
                      {product.oldPrice && (
                        <div className="text-xs text-glowe-muted line-through">{formatCOP(product.oldPrice)}</div>
                      )}
                      <div className="text-lg font-bold text-glowe-dark">{formatCOP(product.price)}</div>
                    </div>

                    <Button variant="gradient" size="sm" onClick={() => handleAddToCart(product)}>
                      Añadir
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
