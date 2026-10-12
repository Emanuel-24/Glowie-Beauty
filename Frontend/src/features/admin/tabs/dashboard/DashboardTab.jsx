import { TrendingUp, Clock, DollarSign, AlertTriangle } from 'lucide-react'
import { formatCOP, formatId } from '@/features/admin/constants'
import DashboardCharts from './DashboardCharts'
import SalesPerformanceChart from './SalesPerformanceChart'
import { MONTH_OPTIONS } from './DashboardTimeFilter'

export default function DashboardTab({
  user,
  summary,
  salesChartData,
  purchases = [],
  filteredPurchases = [],
  products = [],
  categories = [],
  payments = [],
  selectedYear,
  selectedMonth,
  onViewAllOrders,
}) {
  const currentMonthLabel =
    MONTH_OPTIONS.find((m) => m.value === String(selectedMonth))?.label || 'Todos los meses'

  const kpis = [
    {
      label: 'Ventas Totales',
      value: formatCOP(summary.revenue ?? 0),
      badge:
        selectedMonth !== 'all'
          ? `${currentMonthLabel} ${selectedYear}`
          : `Año ${selectedYear}`,
      badgeTone: 'bg-pink-50 text-[#FF758F]',
      tone: 'bg-pink-100 text-[#FF758F]',
      icon: TrendingUp,
    },
    {
      label: 'Pedidos Pendientes',
      value: String(summary.pending ?? 0),
      badge: summary.pending > 0 ? 'Por despachar' : 'Al día',
      badgeTone: summary.pending > 0 ? 'bg-amber-50 text-[#f0b400]' : 'bg-emerald-50 text-emerald-700',
      tone: 'bg-amber-100 text-[#f0b400]',
      icon: Clock,
    },
    {
      label: 'Ganancia Estimada',
      value: formatCOP(summary.estimatedProfit ?? 0),
      badge:
        summary.completedOrders > 0
          ? `${summary.completedOrders} completadas`
          : summary.totalOrders > 0
            ? `${summary.totalOrders} ventas`
            : 'Margen estimado',
      badgeTone: 'bg-emerald-50 text-emerald-700',
      tone: 'bg-emerald-100 text-emerald-700',
      icon: DollarSign,
    },
    {
      label: 'Productos Bajo Stock',
      value: String(summary.lowStock ?? 0),
      badge: summary.lowStock > 0 ? '≤ 5 unidades' : 'Stock óptimo',
      badgeTone: summary.lowStock > 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-700',
      tone: 'bg-rose-100 text-rose-600',
      icon: AlertTriangle,
    },
  ]

  const recentOrdersList = filteredPurchases.length > 0 ? filteredPurchases : purchases

  return (
    <>
      {/* Tarjetas KPI Superiores */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="rounded-[1.6rem] border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-2">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${stat.tone}`}
                >
                  <Icon size={20} className="h-5 w-5" aria-hidden="true" />
                </div>
                {stat.badge && (
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${stat.badgeTone}`}
                  >
                    {stat.badge}
                  </span>
                )}
              </div>
              <p className="mt-4 text-sm font-medium text-glowe-muted">{stat.label}</p>
              <p className="mt-2 font-serif text-3xl font-bold text-glowe-dark">{stat.value}</p>
            </div>
          )
        })}
      </section>

      {/* Gráfica de Rendimiento y Pedidos Recientes */}
      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
        <SalesPerformanceChart
          chartData={salesChartData}
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          monthLabel={currentMonthLabel}
        />

        <section className="rounded-[1.8rem] border border-white/70 bg-white/70 p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-serif text-2xl font-bold text-glowe-dark">Pedidos recientes</h2>
              <p className="text-sm text-glowe-muted">
                {selectedMonth !== 'all' ? `Movimientos de ${currentMonthLabel}` : 'Últimos movimientos'}
              </p>
            </div>
            {onViewAllOrders && (
              <button
                type="button"
                onClick={onViewAllOrders}
                className="text-sm font-semibold text-glowe-pink-accent hover:underline cursor-pointer"
              >
                Ver todos
              </button>
            )}
          </div>
          <div className="space-y-3">
            {recentOrdersList.length === 0 ? (
              <p className="text-sm text-glowe-muted py-6 text-center">
                No hay pedidos para el período seleccionado.
              </p>
            ) : (
              recentOrdersList.slice(0, 4).map((order, index) => (
                <div
                  key={order.id || order.orderId || `${order.customer}-${order.total}-${index}`}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-white/80 bg-white/70 p-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-glowe-pink to-glowe-blue text-[10px] font-black text-white">
                      {(order.customer || 'G').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-glowe-dark">
                        {order.customer || 'Cliente Glowe'}
                      </p>
                      <p className="text-[10px] uppercase tracking-[0.16em] text-glowe-muted">
                        {order.status || 'Completado'} • {order.date || 'Reciente'}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold text-glowe-dark">{formatCOP(order.total || 0)}</p>
                    <p className="text-[10px] text-glowe-muted">{formatId(index + 1, 'Pedido #')}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Gráficas secundarias (Estados, Mix de Catálogo, Compras por Categoría) */}
      <DashboardCharts
        purchases={filteredPurchases.length > 0 ? filteredPurchases : purchases}
        products={products}
        categories={categories}
        payments={payments}
      />
    </>
  )
}
