import AdminModal from '@/features/admin/components/AdminModal'
import { Button } from '@/shared/components/ui'
import { formatCOP } from '@/features/admin/constants'
import { Package, Tag, CheckCircle2, XCircle, AlertTriangle, Layers, Percent } from 'lucide-react'

export default function ProductDetailModal({
  isOpen,
  onClose,
  product,
  salesCount = 0,
}) {
  if (!product) return null

  const cost = Number(product.costPrice || 0)
  const price = Number(product.priceValue ?? product.price ?? 0)
  const margin = price > 0 ? Math.round(((price - cost) / price) * 100) : 0
  const profit = price - cost
  const status = product.status || 'activo'

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title={product.name}
      subtitle={`Detalle de Producto • ${product.brand || 'Glowe Select'}`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-5">
        {/* Encabezado con imagen e info primaria */}
        <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start rounded-2xl border border-white/80 bg-white/70 p-4 shadow-sm">
          <img
            src={
              product.image ||
              'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=500&q=80'
            }
            alt={product.name}
            className="h-28 w-28 shrink-0 rounded-2xl object-cover ring-2 ring-glowe-pink/40 shadow-xs"
          />
          <div className="flex-1 min-w-0 text-center sm:text-left space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-glowe-muted">
                {product.category || 'Sin categoría'}
              </span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  status === 'activo'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : status === 'inactivo'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-stone-100 text-stone-500 border border-stone-200'
                }`}
              >
                {status.toUpperCase()}
              </span>
              {product.badge && (
                <span className="rounded-full bg-pink-100 px-2.5 py-0.5 text-[10px] font-bold text-glowe-pink-accent">
                  {product.badge}
                </span>
              )}
            </div>

            <h3 className="font-serif text-xl font-bold text-glowe-dark truncate mt-1">
              {product.name}
            </h3>
            <p className="text-xs text-glowe-muted line-clamp-2">
              {product.desc || product.description || 'Sin descripción detallada.'}
            </p>
          </div>
        </div>

        {/* Tarjetas de Métricas Financieras y Stock */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-2xl border border-white/80 bg-white/80 p-3 shadow-2xs">
            <p className="text-[10px] font-bold uppercase tracking-wider text-glowe-muted">Precio Coste</p>
            <p className="mt-1 text-sm sm:text-base font-bold text-glowe-dark">{formatCOP(cost)}</p>
          </div>

          <div className="rounded-2xl border border-white/80 bg-white/80 p-3 shadow-2xs">
            <p className="text-[10px] font-bold uppercase tracking-wider text-glowe-pink-accent">Precio Venta</p>
            <p className="mt-1 text-sm sm:text-base font-bold text-glowe-pink-accent">{formatCOP(price)}</p>
          </div>

          <div className="rounded-2xl border border-white/80 bg-white/80 p-3 shadow-2xs">
            <p className="text-[10px] font-bold uppercase tracking-wider text-teal-600">Margen Bruto</p>
            <p className="mt-1 text-sm sm:text-base font-bold text-[#59b1aa]">
              {margin}% <span className="text-[11px] font-semibold text-glowe-muted">({formatCOP(profit)})</span>
            </p>
          </div>

          <div className="rounded-2xl border border-white/80 bg-white/80 p-3 shadow-2xs">
            <p className="text-[10px] font-bold uppercase tracking-wider text-glowe-muted">Stock / Ventas</p>
            <p className="mt-1 text-sm sm:text-base font-bold text-glowe-dark">
              {product.stock || 0} <span className="text-[11px] font-normal text-glowe-muted">uds / {salesCount} vtas</span>
            </p>
          </div>
        </div>

        {/* Galería de imágenes (si tiene múltiples) */}
        {Array.isArray(product.images) && product.images.length > 1 && (
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-glowe-muted">
              Galería de Imágenes
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`${product.name} ${idx + 1}`}
                  className="h-16 w-16 rounded-xl object-cover ring-1 ring-glowe-pink/20 shrink-0"
                />
              ))}
            </div>
          </div>
        )}

        {/* Etiquetas / Tags */}
        <div>
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-glowe-muted">
            Etiquetas Asociadas
          </p>
          <div className="flex flex-wrap gap-1.5">
            {Array.isArray(product.tags) && product.tags.length > 0 ? (
              product.tags.map((tg) => (
                <span
                  key={tg}
                  className="rounded-full bg-pink-50 border border-pink-100 px-2.5 py-0.5 text-xs font-semibold text-glowe-pink-accent"
                >
                  #{tg}
                </span>
              ))
            ) : (
              <span className="text-xs text-glowe-muted italic">Sin etiquetas asignadas.</span>
            )}
          </div>
        </div>

        {/* Botón de Cierre */}
        <div className="flex justify-end pt-2 border-t border-glowe-pink/20">
          <Button variant="glass" size="sm" onClick={onClose} className="w-full sm:w-auto">
            Cerrar detalle
          </Button>
        </div>
      </div>
    </AdminModal>
  )
}
