import { useMemo, useState } from 'react'
import { PieChart as PieIcon } from 'lucide-react'
import { formatCOP } from '@/features/admin/constants'

const CATEGORY_COLORS = [
  { fill: '#FF758F', stroke: '#E05A74', dot: 'bg-[#FF758F]' },
  { fill: '#59B1AA', stroke: '#449791', dot: 'bg-[#59B1AA]' },
  { fill: '#F0B400', stroke: '#D49E00', dot: 'bg-[#F0B400]' },
  { fill: '#6EA8E0', stroke: '#568EC5', dot: 'bg-[#6EA8E0]' },
  { fill: '#A78BFA', stroke: '#8B5CF6', dot: 'bg-[#A78BFA]' },
  { fill: '#F472B6', stroke: '#EC4899', dot: 'bg-[#F472B6]' },
  { fill: '#34D399', stroke: '#10B981', dot: 'bg-[#34D399]' },
  { fill: '#FB923C', stroke: '#F97316', dot: 'bg-[#FB923C]' },
]

export default function CategoryPurchasesPieChart({ purchases = [], products = [], categories = [] }) {
  const [hoveredSlice, setHoveredSlice] = useState(null)

  const categoryPurchasesStats = useMemo(() => {
    const map = {}
    let totalSales = 0

    purchases.forEach((order) => {
      const isCancelled = String(order?.status || '').toLowerCase() === 'anulada'
      if (isCancelled) return

      const items = Array.isArray(order?.items) ? order.items : []
      items.forEach((item) => {
        let catName = 'Otros'
        const itemPid = String(item?.productId || item?.id || '')
        const matchedProd = products.find((p) => String(p?._id || p?.id || '') === itemPid)

        if (matchedProd && matchedProd.category) {
          catName = matchedProd.category
        } else if (item.category) {
          catName = item.category
        }

        const catNorm = catName.charAt(0).toUpperCase() + catName.slice(1).toLowerCase()
        const itemTotal = (Number(item.price) || 0) * (Number(item.quantity) || 1)

        if (!map[catNorm]) {
          map[catNorm] = { totalAmount: 0, count: 0 }
        }
        map[catNorm].totalAmount += itemTotal
        map[catNorm].count += Number(item.quantity) || 1
        totalSales += itemTotal
      })
    })

    if (totalSales === 0 && categories.length > 0) {
      categories.forEach((cat) => {
        const revNumeric = Number(String(cat.revenue || '0').replace(/[^0-9]/g, '')) || 0
        if (!map[cat.name]) {
          map[cat.name] = { totalAmount: 0, count: 0 }
        }
        map[cat.name].totalAmount = revNumeric
        map[cat.name].count = Number(cat.products || 1)
        totalSales += revNumeric
      })
    }

    const rawItems = Object.entries(map).map(([name, data]) => ({
      name,
      totalAmount: data.totalAmount,
      count: data.count,
    }))

    rawItems.sort((a, b) => b.totalAmount - a.totalAmount)

    let cumulativeAngle = 0
    const slices = rawItems.map((item, idx) => {
      const color = CATEGORY_COLORS[idx % CATEGORY_COLORS.length]
      const percentage = totalSales > 0 ? (item.totalAmount / totalSales) * 100 : 0
      const angle = totalSales > 0 ? (item.totalAmount / totalSales) * 360 : 0
      const startAngle = cumulativeAngle
      const endAngle = cumulativeAngle + angle
      cumulativeAngle = endAngle

      return {
        ...item,
        percentage,
        color,
        startAngle,
        endAngle,
      }
    })

    return { totalSales, slices }
  }, [purchases, products, categories])

  const getCoordinatesForPercent = (angleInDegrees, radius = 70, cx = 100, cy = 100) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0
    return {
      x: cx + radius * Math.cos(angleInRadians),
      y: cy + radius * Math.sin(angleInRadians),
    }
  }

  const createSlicePath = (startAngle, endAngle) => {
    const sweepAngle = endAngle - startAngle
    if (sweepAngle >= 359.99) {
      return 'M 100, 30 A 70 70 0 1 1 99.99 30 Z'
    }
    const start = getCoordinatesForPercent(startAngle)
    const end = getCoordinatesForPercent(endAngle)
    const largeArcFlag = sweepAngle > 180 ? 1 : 0

    return `M 100 100 L ${start.x} ${start.y} A 70 70 0 ${largeArcFlag} 1 ${end.x} ${end.y} Z`
  }

  return (
    <section className="relative rounded-[1.8rem] border border-white/70 bg-white/75 p-5 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md md:col-span-2 xl:col-span-1">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="font-serif text-lg font-bold text-glowe-dark">Compras por Categorías</h2>
          <p className="text-xs text-glowe-muted">Participación en ventas por categoría</p>
        </div>
        <span className="rounded-full bg-pink-50 px-2.5 py-0.5 text-xs font-bold text-glowe-pink-accent">
          {formatCOP(categoryPurchasesStats.totalSales)}
        </span>
      </div>

      {categoryPurchasesStats.slices.length > 0 ? (
        <div className="flex flex-col items-center gap-4 pt-1">
          <div className="relative flex items-center justify-center">
            <svg viewBox="0 0 200 200" className="h-44 w-44 filter drop-shadow-xs transition-transform duration-300">
              {categoryPurchasesStats.totalSales > 0 ? (
                categoryPurchasesStats.slices.map((slice) => {
                  if (slice.percentage <= 0) return null
                  const isHovered = hoveredSlice?.name === slice.name
                  const pathD = createSlicePath(slice.startAngle, slice.endAngle)

                  return (
                    <path
                      key={slice.name}
                      d={pathD}
                      fill={slice.color.fill}
                      stroke="#ffffff"
                      strokeWidth={isHovered ? '2.5' : '1.5'}
                      className="cursor-pointer transition-all duration-200"
                      style={{
                        transformOrigin: '100px 100px',
                        transform: isHovered ? 'scale(1.04)' : 'scale(1)',
                        filter: isHovered ? 'brightness(1.08)' : 'none',
                      }}
                      onMouseEnter={() => setHoveredSlice(slice)}
                      onMouseLeave={() => setHoveredSlice(null)}
                    />
                  )
                })
              ) : (
                <circle cx="100" cy="100" r="70" fill="none" stroke="#F3F4F6" strokeWidth="24" />
              )}
              <circle cx="100" cy="100" r="32" fill="#ffffff" className="shadow-inner" />
              <circle cx="100" cy="100" r="32" fill="rgba(255, 255, 255, 0.85)" />
            </svg>

            {hoveredSlice ? (
              <div
                role="tooltip"
                className="pointer-events-none absolute z-30 flex flex-col items-center rounded-xl border border-white/90 bg-white/95 px-3 py-1.5 shadow-lg backdrop-blur-md transition-all animate-in fade-in zoom-in-95 duration-150"
              >
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-glowe-muted">
                  {hoveredSlice.name}
                </span>
                <span className="text-xs font-bold text-glowe-dark">{formatCOP(hoveredSlice.totalAmount)}</span>
                <span className="text-[10px] font-semibold text-glowe-pink-accent">
                  {hoveredSlice.percentage.toFixed(1)}% de compras
                </span>
              </div>
            ) : (
              <div className="pointer-events-none absolute z-10 flex flex-col items-center text-center">
                <PieIcon className="h-4 w-4 text-glowe-pink-accent/70" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-glowe-muted">Glowe</span>
              </div>
            )}
          </div>

          <div className="w-full space-y-1.5 pt-1">
            {categoryPurchasesStats.slices.map((slice) => {
              const isHovered = hoveredSlice?.name === slice.name
              return (
                <div
                  key={slice.name}
                  onMouseEnter={() => setHoveredSlice(slice)}
                  onMouseLeave={() => setHoveredSlice(null)}
                  className={`flex cursor-pointer items-center justify-between rounded-xl px-2 py-1 text-xs transition-all ${
                    isHovered ? 'bg-white shadow-xs font-bold scale-[1.01]' : 'hover:bg-white/60 text-glowe-dark'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${slice.color.dot}`} aria-hidden="true" />
                    <span className="truncate font-medium">{slice.name}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-bold text-glowe-dark">{formatCOP(slice.totalAmount)}</span>
                    <span className="w-11 text-right text-[11px] font-semibold text-glowe-muted">
                      ({slice.percentage.toFixed(0)}%)
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="flex h-40 flex-col items-center justify-center rounded-2xl bg-white/50 text-center">
          <PieIcon className="h-8 w-8 text-glowe-muted/40" />
          <p className="mt-2 text-xs text-glowe-muted">Sin datos de compras por categoría.</p>
        </div>
      )}
    </section>
  )
}
