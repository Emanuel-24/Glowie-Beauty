import { useState, useRef, useEffect, useCallback, useId } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, Check } from 'lucide-react'

const sizes = {
  sm: 'h-10 px-3.5 text-xs',
  md: 'h-11 px-4 text-xs',
}

/**
 * Select — Componente de selección accesible con efecto Glassmorphism y soporte de teclado.
 * Renderiza su menú en un Portal flotante con z-[9999] para prevenir recortes por stacking context / overflow en modales.
 */
export default function Select({
  name,
  id,
  value,
  onChange,
  options = [],
  placeholder = 'Seleccionar...',
  disabled = false,
  error = false,
  errorMessage = '',
  size = 'md',
  className = '',
  containerClassName = '',
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [coords, setCoords] = useState(null)
  const containerRef = useRef(null)
  const listboxRef = useRef(null)
  const generatedId = useId()
  const selectId = id || generatedId

  // Normalizar opciones a formato { value, label, disabled }
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === 'object' && opt !== null) {
      return {
        value: opt.value !== undefined ? opt.value : '',
        label: opt.label !== undefined ? opt.label : String(opt.value),
        disabled: Boolean(opt.disabled),
      }
    }
    return {
      value: opt,
      label: String(opt),
      disabled: false,
    }
  })

  const selectedOption = normalizedOptions.find((opt) => String(opt.value) === String(value))
  const hasError = Boolean(error || errorMessage)
  const displayError = typeof error === 'string' ? error : errorMessage

  // Cálculo de posición flotante para evitar recortes en modales con overflow-hidden
  useEffect(() => {
    if (!isOpen || !containerRef.current) return

    const updatePosition = () => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const popoverHeight = 240
      const spaceBelow = window.innerHeight - rect.bottom
      const showAbove = spaceBelow < popoverHeight && rect.top > popoverHeight

      const top = showAbove ? rect.top - popoverHeight - 4 : rect.bottom + 4
      setCoords({
        top,
        left: rect.left,
        width: rect.width,
      })
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)

    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [isOpen])

  // Manejo de clic exterior y tecla Escape
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target) &&
        listboxRef.current &&
        !listboxRef.current.contains(event.target)
      ) {
        setIsOpen(false)
      }
    }

    const handleKeyDownGlobal = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDownGlobal)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDownGlobal)
    }
  }, [isOpen])

  const handleSelect = useCallback(
    (opt) => {
      if (opt.disabled || disabled) return
      setIsOpen(false)

      if (onChange) {
        onChange({
          target: {
            name,
            value: opt.value,
          },
        })
      }
    },
    [disabled, name, onChange],
  )

  const handleKeyDown = (event) => {
    if (disabled) return

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      if (isOpen && highlightedIndex >= 0 && highlightedIndex < normalizedOptions.length) {
        handleSelect(normalizedOptions[highlightedIndex])
      } else {
        setIsOpen((prev) => !prev)
      }
    } else if (event.key === 'ArrowDown') {
      event.preventDefault()
      if (!isOpen) {
        setIsOpen(true)
        setHighlightedIndex(0)
      } else {
        setHighlightedIndex((prev) => (prev + 1 < normalizedOptions.length ? prev + 1 : 0))
      }
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      if (!isOpen) {
        setIsOpen(true)
        setHighlightedIndex(normalizedOptions.length - 1)
      } else {
        setHighlightedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : normalizedOptions.length - 1))
      }
    } else if (event.key === 'Escape' || event.key === 'Tab') {
      setIsOpen(false)
    }
  }

  const borderClass = hasError
    ? '!border-rose-400 focus:!ring-rose-200'
    : 'border-white/70 hover:border-glowe-pink/60 focus:border-glowe-pink-accent'

  return (
    <div ref={containerRef} className={`relative w-full ${containerClassName}`}>
      <button
        id={selectId}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={selectId}
        className={`group relative flex w-full items-center justify-between rounded-full bg-white/80 backdrop-blur-md border shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-glowe-pink-accent disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
          sizes[size] || sizes.md
        } ${borderClass} ${className}`}
      >
        <span
          className={`truncate font-semibold ${
            selectedOption ? 'text-glowe-dark' : 'text-glowe-muted'
          }`}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`ml-2 h-4 w-4 shrink-0 text-glowe-muted transition-transform duration-200 group-hover:text-glowe-dark ${
            isOpen ? 'rotate-180 text-glowe-pink-accent' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      {/* Menú desplegable Glassmorphism montado en Portal */}
      {isOpen &&
        coords &&
        createPortal(
          <div
            ref={listboxRef}
            role="listbox"
            tabIndex={-1}
            aria-labelledby={selectId}
            style={{
              position: 'fixed',
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              width: `${coords.width}px`,
              zIndex: 9999,
            }}
            className="max-h-60 overflow-y-auto rounded-2xl border border-white/90 bg-white/98 p-1 shadow-2xl backdrop-blur-2xl scrollbar-none hide-scrollbar animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            {normalizedOptions.length === 0 ? (
              <div className="px-3 py-2 text-center text-xs text-glowe-muted">Sin opciones</div>
            ) : (
              normalizedOptions.map((opt, index) => {
                const isSelected = selectedOption && String(selectedOption.value) === String(opt.value)
                const isHighlighted = highlightedIndex === index

                return (
                  <div
                    key={`${opt.value}-${index}`}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(opt)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-colors cursor-pointer ${
                      opt.disabled
                        ? 'opacity-40 cursor-not-allowed'
                        : isSelected
                        ? 'bg-pink-100/70 text-glowe-pink-accent font-bold'
                        : isHighlighted
                        ? 'bg-pink-50 text-glowe-dark'
                        : 'text-glowe-dark hover:bg-pink-50'
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && <Check className="ml-2 h-3.5 w-3.5 text-glowe-pink-accent shrink-0" />}
                  </div>
                )
              })
            )}
          </div>,
          document.body
        )}

      {displayError && (
        <p className="mt-1 text-[11px] font-medium text-rose-500 transition-all duration-200" role="alert">
          {displayError}
        </p>
      )}
    </div>
  )
}
