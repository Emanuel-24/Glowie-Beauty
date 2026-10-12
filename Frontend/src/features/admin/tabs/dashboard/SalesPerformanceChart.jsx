import { formatCOP } from '@/features/admin/constants'

export default function SalesPerformanceChart({
  chartData,
  selectedYear,
  selectedMonth,
  monthLabel,
}) {
  const isMonthView = selectedMonth !== 'all'
  const title = isMonthView
    ? `Rendimiento de ventas — ${monthLabel} ${selectedYear}`
    : `Rendimiento de ventas — Año ${selectedYear}`
  const subtitle = isMonthView
    ? 'Evolución de ventas agrupada por semanas / días del mes'
    : 'Ingresos generados por mes durante el año seleccionado'

  return (
    <section className="rounded-[1.8rem] border border-white/70 bg-white/75 p-5 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-serif text-2xl font-bold text-glowe-dark">{title}</h2>
          <p className="text-sm text-glowe-muted">{subtitle}</p>
        </div>
        <div className="rounded-full bg-pink-50 px-3.5 py-1 text-sm font-bold text-glowe-pink-accent shadow-xs border border-pink-100/80">
          Total: {formatCOP(chartData.totalSales)}
        </div>
      </div>

      {chartData.totalSales > 0 ? (
        <div className="h-64 rounded-[1.5rem] bg-gradient-to-b from-pink-50/70 via-white to-teal-50/60 p-4 border border-white/80 shadow-inner">
          <div className="flex h-full items-end justify-between gap-1.5 sm:gap-2.5">
            {chartData.values.map((item) => (
              <div
                key={item.key}
                className="group relative flex flex-1 flex-col items-center justify-end gap-2 h-full"
              >
                {/* Tooltip en hover */}
                <div className="pointer-events-none absolute -top-9 z-20 hidden rounded-xl border border-white/90 bg-white/95 px-2.5 py-1 text-[11px] font-bold text-glowe-dark shadow-md backdrop-blur-md group-hover:flex flex-col items-center whitespace-nowrap">
                  <span>{item.label}</span>
                  <span className="text-glowe-pink-accent font-black">{formatCOP(item.total)}</span>
                </div>

                {/* Barra de la gráfica */}
                <div
                  className="w-full rounded-t-[1rem] bg-gradient-to-t from-glowe-pink-accent to-[#59b1aa] transition-all duration-300 group-hover:brightness-110 group-hover:scale-y-105 origin-bottom"
                  style={{
                    height: `${Math.max(item.height, 4)}%`,
                    opacity: item.total > 0 ? 1 : 0.25,
                  }}
                />

                {/* Etiqueta del eje X */}
                <span className="text-[10px] font-bold uppercase tracking-wider text-glowe-muted group-hover:text-glowe-dark transition-colors truncate max-w-full text-center">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex h-64 flex-col items-center justify-center rounded-[1.5rem] bg-gradient-to-b from-pink-50/50 via-white to-sky-50/50 p-4 text-center">
          <p className="text-sm font-semibold text-glowe-dark">
            Sin ventas registradas en {isMonthView ? `${monthLabel} de ${selectedYear}` : `el año ${selectedYear}`}.
          </p>
          <p className="mt-1 text-xs text-glowe-muted">
            Los datos se actualizarán automáticamente en cuanto se procesen nuevos pedidos.
          </p>
        </div>
      )}
    </section>
  )
}
