import { useState } from 'react'
import Button from '@/shared/components/ui/Button'
import Input from '@/shared/components/ui/Input'
import StatusBadge from '@/features/admin/components/StatusBadge'
import { formatCOP } from '@/features/admin/constants'
import { updateProduct, batchUpdateFeaturedOffers } from '@/features/products/services/productService'
import { useToast } from '@/shared/toast'

export default function GlowDealsBatchSection({
  products = [],
  setProducts,
  onOpenOfferModal,
}) {
  const { showToast } = useToast()
  const [batchOfferEndDate, setBatchOfferEndDate] = useState('')
  const [isUpdatingBatchOffers, setIsUpdatingBatchOffers] = useState(false)

  const featuredProducts = products.filter((p) => p.isFeaturedOffer)

  const handleBatchStartOffers = async () => {
    if (!batchOfferEndDate) {
      showToast('Fecha requerida', 'Debes seleccionar una fecha y hora de vencimiento.', '⚠️')
      return
    }

    const selectedTime = new Date(batchOfferEndDate).getTime()
    if (Number.isNaN(selectedTime) || selectedTime <= Date.now()) {
      showToast('Fecha inválida', 'La fecha y hora de vencimiento debe ser a futuro.', '⚠️')
      return
    }

    if (featuredProducts.length === 0) {
      showToast('Sin productos', 'No hay productos marcados como oferta destacada (isFeaturedOffer).', '⚠️')
      return
    }

    setIsUpdatingBatchOffers(true)
    const isoEndDate = new Date(batchOfferEndDate).toISOString()
    const productIds = featuredProducts.map((p) => p.id ?? p._id)

    try {
      const updatedList = await batchUpdateFeaturedOffers({
        offerEndDate: isoEndDate,
        productIds,
      })

      const updatedMap = new Map((updatedList || []).map((p) => [p.id ?? p._id, p]))
      setProducts?.((prev) =>
        prev.map((item) => {
          const id = item.id ?? item._id
          if (updatedMap.has(id)) {
            return { ...item, ...updatedMap.get(id) }
          }
          if (productIds.includes(id)) {
            return {
              ...item,
              isOffer: true,
              offerEndDate: isoEndDate,
            }
          }
          return item
        }),
      )

      showToast(
        '¡Ofertas iniciadas! ⚡',
        `Se sincronizó la expiración para ${featuredProducts.length} producto(s) de Glow Deals.`,
        '🚀',
      )
    } catch (err) {
      try {
        await Promise.all(
          featuredProducts.map((p) =>
            updateProduct(p.id ?? p._id, {
              isOffer: true,
              offerEndDate: isoEndDate,
            }),
          ),
        )

        setProducts?.((prev) =>
          prev.map((item) => {
            const id = item.id ?? item._id
            if (productIds.includes(id)) {
              return {
                ...item,
                isOffer: true,
                offerEndDate: isoEndDate,
              }
            }
            return item
          }),
        )

        showToast('¡Ofertas iniciadas! ⚡', `Se actualizaron ${featuredProducts.length} productos destacados.`, '🚀')
      } catch (fallbackErr) {
        showToast('Error', fallbackErr.message || err.message || 'No se pudieron actualizar las ofertas.', '❌')
      }
    } finally {
      setIsUpdatingBatchOffers(false)
    }
  }

  return (
    <section className="rounded-[2rem] border border-amber-200/90 bg-gradient-to-br from-amber-50/70 via-white/80 to-rose-50/60 p-5 shadow-sm backdrop-blur-md sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-100/90 px-3 py-1 text-[11px] font-bold text-amber-900 shadow-xs">
            <span>⭐</span> GLOW DEALS — CARRUSEL DESTACADO (MÁX. 3)
          </div>
          <h2 className="mt-2 font-serif text-xl font-bold text-glowe-dark sm:text-2xl">
            Configuración Masiva de Expiración
          </h2>
          <p className="mt-1 text-xs text-glowe-muted max-w-xl">
            Sincroniza la fecha y hora de vencimiento de los 3 productos destacados para mantener el contador regresivo unificado y sin desincronizaciones.
          </p>
        </div>

        {/* Selector y botón de acción rápida */}
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-end">
          <div className="space-y-1">
            <label htmlFor="batch-offer-ends" className="block text-[10px] font-bold uppercase tracking-wider text-glowe-dark">
              Fin de Ofertas (Fecha y Hora)
            </label>
            <Input
              id="batch-offer-ends"
              type="datetime-local"
              value={batchOfferEndDate}
              onChange={(e) => setBatchOfferEndDate(e.target.value)}
              className="text-xs bg-white/95 font-semibold text-glowe-dark border-amber-300 focus:border-amber-500"
            />
          </div>
          <Button
            variant="gradient"
            size="md"
            onClick={handleBatchStartOffers}
            loading={isUpdatingBatchOffers}
            disabled={isUpdatingBatchOffers}
            className="shadow-md h-[42px] px-5 bg-gradient-to-r from-amber-500 via-rose-500 to-pink-500 text-white font-bold"
          >
            🚀 Iniciar ofertas
          </Button>
        </div>
      </div>

      {/* Lista de productos destacados con isFeaturedOffer: true */}
      <div className="mt-5 border-t border-amber-200/60 pt-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-glowe-dark uppercase tracking-wider">
            Productos en el Grupo Destacado ({featuredProducts.length}/3):
          </span>
          {featuredProducts.length > 3 && (
            <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
              ⚠️ Se recomienda un máximo de 3 productos para el carrusel
            </span>
          )}
        </div>

        {featuredProducts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-amber-300 bg-white/60 p-6 text-center">
            <p className="text-xs font-bold text-glowe-dark">No hay productos destacados activos.</p>
            <p className="text-[11px] text-glowe-muted mt-1">
              Edita o configura un producto abajo y marca la casilla "⭐ Destacar en el carrusel principal (isFeaturedOffer)".
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProducts.slice(0, 3).map((featuredProduct) => {
              const regular = featuredProduct.oldPrice && featuredProduct.oldPrice > featuredProduct.price
                ? featuredProduct.oldPrice
                : featuredProduct.price
              const currentOffer = featuredProduct.price

              return (
                <div
                  key={featuredProduct.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-white/90 bg-white/85 p-3.5 shadow-xs transition hover:shadow-sm"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={featuredProduct.image}
                      alt={featuredProduct.name}
                      className="h-12 w-12 rounded-xl object-cover shadow-xs bg-slate-100 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="truncate font-bold text-xs text-glowe-dark">{featuredProduct.name}</p>
                      <p className="text-[10px] text-glowe-pink-accent font-semibold truncate">
                        {featuredProduct.brand} • <span className="text-rose-600 font-bold">-{featuredProduct.discountPercentage || 20}%</span>
                      </p>
                      <p className="text-[11px] font-bold text-glowe-dark mt-0.5">
                        {formatCOP(currentOffer)} <span className="line-through text-[10px] text-glowe-muted font-normal">{formatCOP(regular)}</span>
                      </p>
                      <div className="mt-1 text-[10px] text-glowe-muted">
                        {featuredProduct.offerEndDate ? (
                          <span className="text-emerald-700 font-semibold">
                            ⏰ Vence: {new Date(featuredProduct.offerEndDate).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })}
                          </span>
                        ) : (
                          <span className="text-amber-700">⚠️ Sin fecha de fin configurada</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex flex-col gap-1">
                    <StatusBadge label="Glow Deals" tone="success" />
                    <button
                      type="button"
                      onClick={() => onOpenOfferModal?.(featuredProduct)}
                      className="text-[10px] font-bold text-glowe-dark hover:text-glowe-pink-accent underline text-right mt-1"
                    >
                      Editar
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
