import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '@/features/cart/hooks/useCart'
import { useToast } from '@/shared/toast'
import { getProducts } from '@/features/products/services/productService'
import { Trash2, X } from 'lucide-react'
import Button from '@/shared/components/ui/Button'
import QuantityStepper from '@/shared/components/ui/QuantityStepper'

const formatCOP = (n) => `$${n.toLocaleString('es-CO')}`

export default function CartDrawer() {
  const { items, total, isOpen, closeCart, removeItem, addItem, setItemQty } = useCart()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [recommendedProducts, setRecommendedProducts] = useState([])
  const [loadingRecommended, setLoadingRecommended] = useState(false)

  useEffect(() => {
    let active = true

    const loadRecommendedProducts = async () => {
      try {
        setLoadingRecommended(true)
        const products = await getProducts()
        if (!active) return

        const visibleProducts = products
          .filter((product) => product && Boolean(product.isRecommended) && Number(product.stock ?? 0) > 0)
          .sort((a, b) => Number(a.recommendedOrder ?? 0) - Number(b.recommendedOrder ?? 0) || a.name.localeCompare(b.name))

        setRecommendedProducts(visibleProducts.slice(0, 4))
      } catch {
        if (active) setRecommendedProducts([])
      } finally {
        if (active) setLoadingRecommended(false)
      }
    }

    loadRecommendedProducts()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!isOpen) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') closeCart()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, closeCart])

  const emptyCartRecommendations = useMemo(
    () => recommendedProducts.filter((product) => product && product.id && product.image),
    [recommendedProducts],
  )

  const handleCheckout = () => {
    if (items.length === 0) {
      showToast('Carrito vacío', 'Añade productos antes de finalizar la compra.')
      return
    }
closeCart()
    navigate('/checkout')
  }

  return (
    <div
      className={`fixed inset-0 z-[70] transition-opacity duration-300 ${
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      aria-hidden={!isOpen}
    >
      <div className="absolute inset-0 bg-glowe-dark/40 backdrop-blur-sm" onClick={closeCart} />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Carrito de compras"
        className={`absolute inset-y-0 right-0 flex h-[100dvh] w-full max-w-md flex-col bg-white/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl backdrop-blur-md transition-transform duration-300 sm:p-6 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-glowe-pink/40">
            <h2 className="font-serif text-lg font-bold text-glowe-dark">Tu Carrito de Compras 🛍️</h2>
            <button type="button" onClick={closeCart} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-glowe-muted hover:bg-glowe-pink/20 hover:text-glowe-dark" aria-label="Cerrar carrito">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto py-4 pr-1">
            {items.length === 0 ? (
              <div className="space-y-4 py-4">
                <div className="text-center space-y-2">
                  <span className="text-4xl">🛍️</span>
                  <p className="text-xs text-glowe-muted">Tu carrito está vacío por ahora. ✨</p>
                  <button
                    onClick={() => {
                      closeCart()
                      navigate('/descubrir')
                    }}
                    className="text-xs font-bold text-glowe-pink-accent hover:underline"
                  >
                    Ver productos recomendados
                  </button>
                </div>

                {loadingRecommended ? (
                  <div className="rounded-2xl border border-white/80 bg-white/70 p-4 text-center text-xs text-glowe-muted">
                    Cargando recomendaciones...
                  </div>
                ) : emptyCartRecommendations.length > 0 ? (
                  <div className="space-y-3">
                    {emptyCartRecommendations.map((product) => (
                      <div key={product.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-glowe-pink/30 bg-white/80 p-2 shadow-sm">
                        <img src={product.image} alt={product.name} className="h-14 w-14 rounded-xl object-cover" loading="lazy" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-bold text-glowe-dark">{product.name}</p>
                          <p className="text-[10px] text-glowe-muted">{formatCOP(product.price)}</p>
                        </div>
                        <div className="ml-auto flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => navigate(`/producto/${product.id}`)}
                            className="rounded-full border border-glowe-pink-soft bg-white px-2.5 py-1 text-[10px] font-bold text-glowe-dark transition hover:border-glowe-pink-accent"
                          >
                            Ver
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              addItem(product)
                              showToast('Agregado al carrito', `${product.name} quedó en tu pedido.`, '🛍️')
                            }}
                            className="rounded-full bg-gradient-to-r from-glowe-pink-accent to-glowe-pink px-2.5 py-1 text-[10px] font-bold text-white shadow-sm transition hover:opacity-90"
                          >
                            Añadir
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-glowe-pink/40 bg-white/50 p-4 text-center text-xs text-glowe-muted">
                    Todavía no hay productos recomendados configurados por el administrador.
                  </div>
                )}
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center gap-3 rounded-xl border border-glowe-pink/40 bg-glowe-offwhite p-2"
                >
                  <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" loading="lazy" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-bold text-glowe-dark truncate">{item.name}</h3>
                    <span className="text-xs font-semibold text-glowe-pink-accent">
                      {formatCOP(item.price)} {item.qty > 1 && <span className="text-glowe-muted">× {item.qty}</span>}
                    </span>
                  </div>

                  <div className="ml-auto flex items-center gap-2">
                    <QuantityStepper
                      value={item.qty}
                      min={0}
                      max={99}
                      onDecrease={() => removeItem(item.id)}
                      onIncrease={() => addItem(item)}
                      onChange={(nextQty) => setItemQty(item.id, nextQty)}
                    />
                    <button
                      type="button"
                      onClick={() => setItemQty(item.id, 0)}
                      aria-label={`Eliminar ${item.name} del carrito`}
                      title="Eliminar producto"
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-500 transition hover:bg-red-100 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="border-t border-glowe-pink/40 pt-4 space-y-3">
          <div className="flex justify-between font-bold text-sm text-glowe-dark">
            <span>Total Estimado:</span>
            <span>{formatCOP(total)} COP</span>
          </div>
          <Button onClick={handleCheckout} fullWidth>
            Finalizar Compra ✨
          </Button>
        </div>
      </aside>
    </div>
  )
}
