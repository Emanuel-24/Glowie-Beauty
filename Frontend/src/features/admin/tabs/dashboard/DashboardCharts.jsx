import { useMemo } from 'react'
import {
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  Palette,
  Sparkles,
  Layers,
  PackageCheck,
} from 'lucide-react'
import CategoryPurchasesPieChart from './CategoryPurchasesPieChart'

export default function DashboardCharts({
  purchases = [],
  products = [],
  categories = [],
}) {
  // 1. Gráfica de Estados de Pedidos
  const orderStatusStats = useMemo(() => {
    const total = purchases.length
    if (total === 0) return { total: 0, items: [] }

    const counts = {
      completadas: purchases.filter((p) => String(p?.status || '').toLowerCase() === 'completada').length,
      pendientes: purchases.filter((p) => {
        const s = String(p?.status || '').toLowerCase()
        return s === 'pendiente' || s === ''
      }).length,
      enRuta: purchases.filter((p) => {
        const s = String(p?.status || '').toLowerCase()
        return s === 'procesando' || s === 'enviado'
      }).length,
      anuladas: purchases.filter((p) => String(p?.status || '').toLowerCase() === 'anulada').length,
    }

    const items = [
      {
        key: 'completadas',
        label: 'Completadas',
        count: counts.completadas,
        pct: Math.round((counts.completadas / total) * 100),
        barClass: 'bg-teal-500',
        textClass: 'text-[#59b1aa]',
        icon: CheckCircle2,
      },
      {
        key: 'pendientes',
        label: 'Pendientes',
        count: counts.pendientes,
        pct: Math.round((counts.pendientes / total) * 100),
        barClass: 'bg-amber-400',
        textClass: 'text-amber-600',
        icon: Clock,
      },
      {
        key: 'enRuta',
        label: 'En Despacho / Ruta',
        count: counts.enRuta,
        pct: Math.round((counts.enRuta / total) * 100),
        barClass: 'bg-sky-400',
        textClass: 'text-sky-600',
        icon: Truck,
      },
      {
        key: 'anuladas',
        label: 'Anuladas',
        count: counts.anuladas,
        pct: Math.round((counts.anuladas / total) * 100),
        barClass: 'bg-rose-400',
        textClass: 'text-rose-500',
        icon: XCircle,
      },
    ]

    return { total, items }
  }, [purchases])

  // 2. Gráfica de Distribución por Categoría de Catálogo
  const categoryStats = useMemo(() => {
    const total = products.length
    if (total === 0) return { total: 0, items: [] }

    const groups = {
      maquillaje: {
        label: 'Maquillaje',
        count: products.filter((p) => (p?.category || '').toLowerCase() === 'maquillaje').length,
        color: 'from-[#FF758F] to-[#FF4D6D]',
        textClass: 'text-[#FF758F]',
        icon: Sparkles,
      },
      cabello: {
        label: 'Cuidado Capilar',
        count: products.filter((p) => (p?.category || '').toLowerCase() === 'cabello').length,
        color: 'from-[#59B1AA] to-[#3D8C86]',
        textClass: 'text-[#59B1AA]',
        icon: Layers,
      },
      skincare: {
        label: 'Cuidado Facial',
        count: products.filter((p) => (p?.category || '').toLowerCase() === 'skincare').length,
        color: 'from-[#F0B400] to-[#D49E00]',
        textClass: 'text-[#F0B400]',
        icon: Palette,
      },
      otros: {
        label: 'Otras Categorías',
        count: products.filter((p) => {
          const c = (p?.category || '').toLowerCase()
          return !['maquillaje', 'cabello', 'skincare'].includes(c)
        }).length,
        color: 'from-stone-400 to-stone-500',
        textClass: 'text-stone-500',
        icon: Layers,
      },
    }

    const items = Object.entries(groups)
      .map(([key, data]) => ({
        key,
        ...data,
        pct: total > 0 ? Math.round((data.count / total) * 100) : 0,
      }))
      .filter((item) => item.count > 0 || ['maquillaje', 'cabello'].includes(item.key))

    return { total, items }
  }, [products])

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {/* Gráfica 1: Estado de Pedidos */}
      <section className="rounded-[1.8rem] border border-white/70 bg-white/75 p-5 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-lg font-bold text-glowe-dark">Flujo de Pedidos</h2>
            <p className="text-xs text-glowe-muted">Distribución de estados operativos</p>
          </div>
          <span className="rounded-full bg-pink-50 px-2.5 py-0.5 text-xs font-bold text-glowe-pink-accent">
            {orderStatusStats.total} {orderStatusStats.total === 1 ? 'orden' : 'órdenes'}
          </span>
        </div>

        {orderStatusStats.total > 0 ? (
          <div className="space-y-4">
            <div className="flex h-3 w-full overflow-hidden rounded-full bg-stone-100 p-0.5">
              {orderStatusStats.items.map(
                (item) =>
                  item.pct > 0 && (
                    <div
                      key={item.key}
                      style={{ width: `${item.pct}%` }}
                      className={`${item.barClass} h-full transition-all duration-500 first:rounded-l-full last:rounded-r-full`}
                      title={`${item.label}: ${item.count} (${item.pct}%)`}
                    />
                  ),
              )}
            </div>

            <div className="space-y-2.5 pt-1">
              {orderStatusStats.items.map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.key} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-2xs ${item.textClass}`}
                      >
                        <Icon size={13} aria-hidden="true" />
                      </span>
                      <span className="font-medium text-glowe-dark">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-glowe-dark">{item.count}</span>
                      <span className="w-9 text-right text-[11px] font-semibold text-glowe-muted">
                        {item.pct}%
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="flex h-40 flex-col items-center justify-center rounded-2xl bg-white/50 text-center">
            <PackageCheck className="h-8 w-8 text-glowe-muted/40" />
            <p className="mt-2 text-xs text-glowe-muted">Sin pedidos registrados todavía.</p>
          </div>
        )}
      </section>

      {/* Gráfica 2: Mix de Categorías */}
      <section className="rounded-[1.8rem] border border-white/70 bg-white/75 p-5 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-lg font-bold text-glowe-dark">Mix de Catálogo</h2>
            <p className="text-xs text-glowe-muted">Proporción por categoría multimarca</p>
          </div>
          <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-bold text-glowe-blue-accent">
            {categoryStats.total} {categoryStats.total === 1 ? 'producto' : 'productos'}
          </span>
        </div>

        {categoryStats.total > 0 ? (
          <div className="space-y-3.5 pt-1">
            {categoryStats.items.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.key} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-2xs ${item.textClass}`}
                      >
                        <Icon size={13} aria-hidden="true" />
                      </span>
                      <span className="font-medium text-glowe-dark">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-glowe-dark">{item.count} items</span>
                      <span className="text-[11px] font-semibold text-glowe-muted">({item.pct}%)</span>
                    </div>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-stone-100">
                    <div
                      style={{ width: `${item.pct}%` }}
                      className={`h-full rounded-full bg-gradient-to-r ${item.color} transition-all duration-500`}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex h-40 flex-col items-center justify-center rounded-2xl bg-white/50 text-center">
            <Palette className="h-8 w-8 text-glowe-muted/40" />
            <p className="mt-2 text-xs text-glowe-muted">Sin productos en el catálogo.</p>
          </div>
        )}
      </section>

      {/* Gráfica 3: Circular de Compras por Categorías */}
      <CategoryPurchasesPieChart
        purchases={purchases}
        products={products}
        categories={categories}
      />
    </div>
  )
}
