import { ChevronLeft, ChevronRight } from 'lucide-react'
import { DAYS_SHORT, MONTH_NAMES } from './datePickerUtils'

export default function DatePickerCalendar({
  viewYear,
  viewMonth,
  onPrevMonth,
  onNextMonth,
  onSelectDay,
  isDayDisabled,
  isDaySelected,
  isToday,
  daysInMonth,
  firstDayIndex,
  onSelectToday,
  onClose,
}) {
  return (
    <>
      <div className="flex items-center justify-between border-b border-glowe-pink/20 pb-3">
        <button
          type="button"
          onClick={onPrevMonth}
          aria-label="Mes anterior"
          className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200/70 bg-white/80 text-glowe-muted hover:border-glowe-pink-accent hover:text-glowe-pink-accent transition-colors cursor-pointer"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>

        <span className="font-serif text-sm font-bold text-glowe-dark">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </span>

        <button
          type="button"
          onClick={onNextMonth}
          aria-label="Mes siguiente"
          className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200/70 bg-white/80 text-glowe-muted hover:border-glowe-pink-accent hover:text-glowe-pink-accent transition-colors cursor-pointer"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase tracking-wider text-glowe-muted">
        {DAYS_SHORT.map((day) => (
          <div key={day} className="py-1">
            {day}
          </div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {Array.from({ length: firstDayIndex }).map((_, index) => (
          <div key={`empty-${index}`} className="h-8" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1
          const disabledDay = isDayDisabled(day)
          const selected = isDaySelected(day)
          const today = isToday(day)

          return (
            <button
              key={day}
              type="button"
              disabled={disabledDay}
              onClick={() => onSelectDay(day)}
              className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                selected
                  ? 'bg-gradient-to-r from-glowe-pink-accent to-rose-500 text-white shadow-md shadow-pink-200/60 scale-105'
                  : today
                  ? 'border border-glowe-pink-accent text-glowe-pink-accent font-bold hover:bg-glowe-pink/40'
                  : disabledDay
                  ? 'text-slate-300 cursor-not-allowed'
                  : 'text-glowe-dark hover:bg-glowe-pink/30 hover:text-glowe-pink-accent'
              }`}
            >
              {day}
            </button>
          )
        })}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-glowe-pink/20 pt-2.5 text-xs">
        <button
          type="button"
          onClick={onSelectToday}
          className="font-bold text-glowe-pink-accent hover:underline text-[11px] cursor-pointer"
        >
          Hoy
        </button>
        <button
          type="button"
          onClick={onClose}
          className="text-glowe-muted hover:text-glowe-dark text-[11px] cursor-pointer"
        >
          Cerrar
        </button>
      </div>
    </>
  )
}
