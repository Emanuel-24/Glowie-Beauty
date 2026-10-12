import { ChevronDown } from 'lucide-react'

export const MONTH_OPTIONS = [
  { value: 'all', label: 'Todos los meses' },
  { value: '0', label: 'Enero' },
  { value: '1', label: 'Febrero' },
  { value: '2', label: 'Marzo' },
  { value: '3', label: 'Abril' },
  { value: '4', label: 'Mayo' },
  { value: '5', label: 'Junio' },
  { value: '6', label: 'Julio' },
  { value: '7', label: 'Agosto' },
  { value: '8', label: 'Septiembre' },
  { value: '9', label: 'Octubre' },
  { value: '10', label: 'Noviembre' },
  { value: '11', label: 'Diciembre' },
]

export default function DashboardTimeFilter({
  selectedYear,
  onYearChange,
  selectedMonth,
  onMonthChange,
  availableYears = [],
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Selector de Año */}
      <div className="relative">
        <select
          value={selectedYear}
          onChange={(e) => onYearChange(e.target.value)}
          aria-label="Seleccionar año"
          className="h-10 cursor-pointer appearance-none rounded-xl border border-white/80 bg-white/80 pl-4 pr-9 text-xs sm:text-sm font-bold text-glowe-dark shadow-xs backdrop-blur-md transition-all duration-200 hover:bg-white hover:border-glowe-pink focus:outline-none focus:ring-2 focus:ring-glowe-pink-accent"
        >
          {availableYears.map((yr) => (
            <option key={yr} value={yr} className="bg-white text-glowe-dark">
              Año {yr}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-glowe-muted"
          aria-hidden="true"
        />
      </div>

      {/* Selector de Mes */}
      <div className="relative">
        <select
          value={selectedMonth}
          onChange={(e) => onMonthChange(e.target.value)}
          aria-label="Seleccionar mes"
          className="h-10 cursor-pointer appearance-none rounded-xl border border-white/80 bg-white/80 pl-4 pr-9 text-xs sm:text-sm font-bold text-glowe-dark shadow-xs backdrop-blur-md transition-all duration-200 hover:bg-white hover:border-glowe-pink focus:outline-none focus:ring-2 focus:ring-glowe-pink-accent"
        >
          {MONTH_OPTIONS.map((mo) => (
            <option key={mo.value} value={mo.value} className="bg-white text-glowe-dark">
              {mo.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-glowe-muted"
          aria-hidden="true"
        />
      </div>
    </div>
  )
}
