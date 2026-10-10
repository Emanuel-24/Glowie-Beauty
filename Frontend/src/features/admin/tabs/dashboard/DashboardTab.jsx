import Button from '@/shared/components/ui/Button'
import { formatCOP, formatId } from '@/features/admin/constants'

export default function DashboardTab({
  user,
  summary,
  last7Days,
  purchases = [],
  onExport,
  onViewAllOrders,
}) {
  const todayLabel = new Date().toLocaleDateString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
  const todayLabelCap = todayLabel.charAt(0).toUpperCase() + todayLabel.slice(1)

  return (
    <>
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-glowe-pink-accent">
            {todayLabelCap}
          </p>
          <h1 className="mt-2 font-serif text-3xl font-bold text-glowe-dark md:text-4xl">
            Buenos días, {user?.name?.split(' ')[0] || 'María'} <span aria-hidden="true">✦</span>
          </h1>
          <p className="mt-2 text-sm text-glowe-muted">Panel administrativo puro de Glowe Beauty.</p>
        </div>
        <Button
          variant="glass"
          className="h-12 rounded-full px-5 shadow-sm"
          onClick={onExport}
        >
          Exportar reporte
        </Button>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: 'Ventas totales',
            value: formatCOP(summary.revenue),
            change: '+12.5%',
            tone: 'bg-pink-100 text-pink-700',
            icon: '↗',
          },
          {
            label: 'Pedidos hoy',
            value: String(summary.todayOrders),
            change: '+8.2%',
            tone: 'bg-amber-100 text-amber-700',
            icon: '◌',
          },
          {
            label: 'Clientes únicos',
            value: String(summary.newCustomers),
            change: '+18.7%',
            tone: 'bg-sky-100 text-sky-700',
            icon: '◎',
          },
          {
            label: 'Stock crítico',
            value: String(summary.lowStock),
            change: '-4.3%',
            tone: 'bg-violet-100 text-violet-700',
            icon: '▣',
          },
        ].map((stat) => (
          <div key={stat.label} className="rounded-[1.6rem] border border-white/70 bg-white/75 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className={`rounded-2xl px-2.5 py-2 text-lg ${stat.tone}`}>{stat.icon}</div>
              <span className="text-xs font-bold text-emerald-600">{stat.change}</span>
            </div>
            <p className="mt-4 text-sm text-glowe-muted">{stat.label}</p>
            <p className="mt-2 font-serif text-3xl font-bold text-glowe-dark">{stat.value}</p>
          </div>
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
        <section className="rounded-[1.8rem] border border-white/70 bg-white/70 p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-2">
            <div>
              <h2 className="font-serif text-2xl font-bold text-glowe-dark">Rendimiento de ventas</h2>
              <p className="text-sm text-glowe-muted">Ingresos generados en los últimos 7 días</p>
            </div>
            <div className="rounded-full bg-pink-50 px-3 py-1 text-sm font-bold text-glowe-pink-accent">
              {formatCOP(last7Days.total7d)}
            </div>
          </div>
          {last7Days.total7d > 0 ? (
            <div className="h-56 rounded-[1.5rem] bg-gradient-to-b from-pink-50 via-white to-sky-50 p-4">
              <div className="flex h-full items-end justify-between gap-2">
                {last7Days.values.map((day) => (
                  <div
                    key={day.key}
                    className="flex flex-1 flex-col items-center justify-end gap-2"
                    title={`${day.label}: ${formatCOP(day.total)}`}
                  >
                    <div
                      className="w-full rounded-t-[1.2rem] bg-gradient-to-t from-glowe-pink-accent to-glowe-blue-accent"
                      style={{ height: `${day.height}%` }}
                    />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-glowe-muted">
                      {day.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex h-56 items-center justify-center rounded-[1.5rem] bg-gradient-to-b from-pink-50 via-white to-sky-50 p-4">
              <p className="text-sm text-glowe-muted">Sin ventas registradas en los últimos 7 días.</p>
            </div>
          )}
        </section>

        <section className="rounded-[1.8rem] border border-white/70 bg-white/70 p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-serif text-2xl font-bold text-glowe-dark">Pedidos recientes</h2>
              <p className="text-sm text-glowe-muted">Últimos movimientos</p>
            </div>
            {onViewAllOrders && (
              <button
                type="button"
                onClick={onViewAllOrders}
                className="text-sm font-semibold text-glowe-pink-accent hover:underline"
              >
                Ver todos
              </button>
            )}
          </div>
          <div className="space-y-3">
            {purchases.length === 0 ? (
              <p className="text-sm text-glowe-muted">Todavía no hay pedidos registrados.</p>
            ) : (
              purchases.slice(0, 4).map((order, index) => (
                <div
                  key={order.id || order.orderId || `${order.customer}-${order.total}`}
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
                        {order.status || 'Completado'}
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
    </>
  )
}
