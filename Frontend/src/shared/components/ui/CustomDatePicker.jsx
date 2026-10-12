import { forwardRef, useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Calendar as CalendarIcon, X } from 'lucide-react'
import {
  formatDisplayDate,
  formatISODate,
  parseISODate,
} from './datePickerUtils'
import DatePickerCalendar from './DatePickerCalendar'

const CustomDatePicker = forwardRef(function CustomDatePicker(
  {
    value = '',
    onChange,
    minDate,
    maxDate,
    placeholder = 'Seleccionar fecha',
    disabled = false,
    clearable = true,
    error = false,
    errorMessage = '',
    helperText = '',
    className = '',
    containerClassName = '',
    id,
    name,
    ...props
  },
  ref
) {
  const generatedId = useId()
  const inputId = id || generatedId
  const containerRef = useRef(null)
  const popoverRef = useRef(null)
  const [isOpen, setIsOpen] = useState(false)
  const [coords, setCoords] = useState(null)

  const selectedDate = parseISODate(value)
  const initialView = selectedDate || new Date()
  const [viewYear, setViewYear] = useState(initialView.getFullYear())
  const [viewMonth, setViewMonth] = useState(initialView.getMonth())

  useEffect(() => {
    if (value) {
      const parsed = parseISODate(value)
      if (parsed) {
        setViewYear(parsed.getFullYear())
        setViewMonth(parsed.getMonth())
      }
    }
  }, [value])

  // Posicionamiento dinámico sin recorte por stacking context / overflow
  useEffect(() => {
    if (!isOpen || !containerRef.current) return

    const updatePosition = () => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const popoverHeight = 330
      const spaceBelow = window.innerHeight - rect.bottom
      const showAbove = spaceBelow < popoverHeight && rect.top > popoverHeight

      const top = showAbove ? rect.top - popoverHeight - 6 : rect.bottom + 6
      const left = Math.max(12, Math.min(rect.left, window.innerWidth - 300))

      setCoords({ top, left })
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)

    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [isOpen])

  // Cierre seguro por clic exterior o tecla Escape
  useEffect(() => {
    if (!isOpen) return

    const handleOutsideClick = (e) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target) &&
        popoverRef.current &&
        !popoverRef.current.contains(e.target)
      ) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const handlePrevMonth = (e) => {
    e.stopPropagation()
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear((prev) => prev - 1)
    } else {
      setViewMonth((prev) => prev - 1)
    }
  }

  const handleNextMonth = (e) => {
    e.stopPropagation()
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear((prev) => prev + 1)
    } else {
      setViewMonth((prev) => prev + 1)
    }
  }

  const handleSelectDay = (day) => {
    const newDate = new Date(viewYear, viewMonth, day)
    const isoString = formatISODate(newDate)
    onChange?.({
      target: { name, value: isoString },
      value: isoString,
      date: newDate,
    })
    setIsOpen(false)
  }

  const handleClear = (e) => {
    e.stopPropagation()
    onChange?.({
      target: { name, value: '' },
      value: '',
      date: null,
    })
  }

  const min = minDate ? parseISODate(minDate) : null
  const max = maxDate ? parseISODate(maxDate) : null

  const isDayDisabled = (day) => {
    const current = new Date(viewYear, viewMonth, day)
    if (min && current < min) return true
    if (max && current > max) return true
    return false
  }

  const isDaySelected = (day) => {
    if (!selectedDate) return false
    return (
      selectedDate.getFullYear() === viewYear &&
      selectedDate.getMonth() === viewMonth &&
      selectedDate.getDate() === day
    )
  }

  const isToday = (day) => {
    const today = new Date()
    return (
      today.getFullYear() === viewYear &&
      today.getMonth() === viewMonth &&
      today.getDate() === day
    )
  }

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay()

  const hasError = Boolean(error || errorMessage)
  const displayError = typeof error === 'string' ? error : errorMessage

  return (
    <div ref={containerRef} className={`relative w-full ${containerClassName}`}>
      <div
        id={inputId}
        ref={ref}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        onKeyDown={(e) => {
          if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault()
            setIsOpen((prev) => !prev)
          }
        }}
        className={`glass-input flex min-h-11 items-center justify-between px-4 py-2.5 cursor-pointer select-none transition-all duration-200 ${
          hasError
            ? '!border-rose-400 focus:!ring-rose-200 focus:!border-rose-400 bg-rose-50/20 text-glowe-dark'
            : 'border-glowe-pink/60 hover:border-glowe-pink-dark/80 focus:border-glowe-pink-accent'
        } ${disabled ? 'opacity-60 cursor-not-allowed bg-slate-50' : ''} ${className}`}
        {...props}
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          <CalendarIcon
            className={`h-4 w-4 shrink-0 transition-colors ${
              value ? 'text-glowe-pink-accent' : 'text-glowe-muted'
            }`}
          />
          <span
            className={`truncate text-xs sm:text-sm font-medium ${
              value ? 'text-glowe-dark font-semibold' : 'text-glowe-muted'
            }`}
          >
            {value ? formatDisplayDate(value) : placeholder}
          </span>
        </div>

        <div className="flex items-center gap-1.5 ml-2">
          {clearable && value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Limpiar fecha"
              className="flex h-5 w-5 items-center justify-center rounded-full text-glowe-muted hover:bg-glowe-pink/40 hover:text-glowe-dark transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {isOpen &&
        coords &&
        createPortal(
          <div
            ref={popoverRef}
            role="dialog"
            aria-label="Selector de fecha"
            style={{
              position: 'fixed',
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              zIndex: 9999,
            }}
            className="w-72 rounded-2xl border border-white/90 bg-white/98 p-4 shadow-2xl backdrop-blur-2xl animate-[fadeIn_0.15s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <DatePickerCalendar
              viewYear={viewYear}
              viewMonth={viewMonth}
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
              onSelectDay={handleSelectDay}
              isDayDisabled={isDayDisabled}
              isDaySelected={isDaySelected}
              isToday={isToday}
              daysInMonth={daysInMonth}
              firstDayIndex={firstDayIndex}
              onSelectToday={() => {
                const today = new Date()
                setViewYear(today.getFullYear())
                setViewMonth(today.getMonth())
                handleSelectDay(today.getDate())
              }}
              onClose={() => setIsOpen(false)}
            />
          </div>,
          document.body
        )}

      {displayError ? (
        <p className="mt-1 text-[11px] font-medium text-rose-500 transition-all duration-200" role="alert">
          {displayError}
        </p>
      ) : helperText ? (
        <p className="mt-1 text-[11px] text-glowe-muted transition-all duration-200">
          {helperText}
        </p>
      ) : null}
    </div>
  )
})

CustomDatePicker.displayName = 'CustomDatePicker'

export default CustomDatePicker
