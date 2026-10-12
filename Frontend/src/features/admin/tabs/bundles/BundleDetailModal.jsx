import AdminModal from '@/features/admin/components/AdminModal'
import { Button } from '@/shared/components/ui'
import { formatCOP } from '@/features/admin/constants'
import { Sparkles, Package, TrendingDown } from 'lucide-react'

export default function BundleDetailModal({
  isOpen,
  onClose,
  bundle,
  products = [],
}) {
  if (!bundle) return null

  const bundlePrice = Number(bundle.priceValue ?? bundle.price ?? 0)
  const oldPrice = Number(bundle.oldPriceValue ?? bundle.oldPrice ?? 0)

  // Obtener productos incluidos completos
  const includedProducts = (bundle.productIds || []).map((pRef) => {
    const pId = typeof pRef === 'object' && pRef ? pRef.id || pRef._id : pRef
    const found = products.find((p) => String(p.id ?? p._id) === String(pId))
    return (
      found || {
        id: pId,
        name: typeof pRef === 'object' && pRef?.name ? pRef.name : 'Producto del kit',
        price: 0,
        brand: 'Glowe Select',
        image: '',
      }
    )
  })

  // Calcular suma individual
  const sumIndividual = includedProducts.reduce((acc, curr) => acc + Number(curr.price || 0), 0)
  const referencePrice = oldPrice > 0 ? oldPrice : sumIndividual
  const savings = referencePrice > bundlePrice ? referencePrice - bundlePrice : 0
  const savingsPct = referencePrice > 0 && savings > 0 ? Math.round((savings / referencePrice) * 100) : 0

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title={bundle.name}
      subtitle={`Detalle de Combo • ${bundle.badge || 'COMBO ESPECIAL'}`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-5">
        {/* Encabezado con imagen e info */}
        <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start rounded-2xl border border-white/80 bg-white/70 p-4 shadow-sm">
          <img
            src={
              bundle.image ||
              'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80'
            }
            alt={bundle.name}
            className="h-28 w-28 shrink-0 rounded-2xl object-cover ring-2 ring-glowe-pink/40 shadow-xs"
          />
          <div className="flex-1 min-w-0 text-center sm:text-left space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="rounded-full bg-pink-100 px-2.5 py-0.5 text-[10px] font-bold text-glowe-pink-accent">
                {bundle.badge || 'COMBO'}
              </span>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-glowe-muted">
                {includedProducts.length} {includedProducts.length === 1 ? 'producto' : 'productos'}
              </span>
            </div>

            <h3 className="font-serif text-xl font-bold text-glowe-dark truncate mt-1">
              {bundle.name}
            </h3>
            <p className="text-xs text-glowe-muted">
              {bundle.desc || 'Paquete exclusivo con precio especial.'}
            </p>
          </div>
        </div>

        {/* Tarjetas de Precios y Ahorro */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-white/80 bg-white/80 p-3 shadow-2xs text-center sm:text-left">
            <p className="text-[10px] font-bold uppercase tracking-wider text-glowe-muted">Precio Combo</p>
            <p className="mt-1 text-sm sm:text-base font-bold text-glowe-pink-accent">
              {formatCOP(bundlePrice)}
            </p>
          </div>

          <div className="rounded-2xl border border-white/80 bg-white/80 p-3 shadow-2xs text-center sm:text-left">
            <p className="text-[10px] font-bold uppercase tracking-wider text-glowe-muted">Suma Individual</p>
            <p className="mt-1 text-sm sm:text-base font-bold text-glowe-dark">
              {formatCOP(sumIndividual > 0 ? sumIndividual : referencePrice)}
            </p>
          </div>

          <div className="rounded-2xl border border-white/80 bg-emerald-50/70 p-3 shadow-2xs border-emerald-200/60 text-center sm:text-left">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Ahorro Cliente</p>
            <p className="mt-1 text-sm sm:text-base font-bold text-emerald-700">
              {formatCOP(savings)} {savingsPct > 0 && <span className="text-xs">(-{savingsPct}%)</span>}
            </p>
          </div>
        </div>

        {/* Lista de Productos Incluidos */}
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-glowe-muted">
            Productos incluidos en el paquete:
          </p>
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {includedProducts.length === 0 ? (
              <p className="text-xs text-glowe-muted italic">No hay productos vinculados.</p>
            ) : (
              includedProducts.map((prod, idx) => (
                <div
                  key={prod.id || idx}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/80 bg-white/60 p-2.5"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {prod.image ? (
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="h-10 w-10 shrink-0 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-pink-100 text-glowe-pink-accent">
                        <Package className="h-5 w-5" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-glowe-dark truncate">{prod.name}</p>
                      <p className="text-[10px] text-glowe-muted uppercase tracking-wider">
                        {prod.brand || 'Glowe Select'}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-semibold text-glowe-dark shrink-0">
                    {formatCOP(prod.price || 0)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Cierre */}
        <div className="flex justify-end pt-2 border-t border-glowe-pink/20">
          <Button variant="glass" size="sm" onClick={onClose} className="w-full sm:w-auto">
            Cerrar detalle
          </Button>
        </div>
      </div>
    </AdminModal>
  )
}
