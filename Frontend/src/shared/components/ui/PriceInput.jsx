import { forwardRef, useEffect, useId, useState } from 'react'

const formatCOP = (num) => {
  if (num === null || num === undefined || num === '' || Number.isNaN(Number(num))) {
    return ''
  }
  return new Intl.NumberFormat('es-CO', {
    maximumFractionDigits: 0,
  }).format(num)
}

const parseNumeric = (str) => {
  if (!str) return 0
  const cleanStr = String(str).replace(/\D/g, '')
  return cleanStr ? parseInt(cleanStr, 10) : 0
}

const PriceInput = forwardRef(function PriceInput(
  {
    value,
    onChange,
    maxValue = 9999999,
    minValue = 0,
    size = 'md',
    prefix = '$',
    currency = 'COP',
    className = '',
    containerClassName = '',
    error = false,
    errorMessage = '',
    helperText = '',
    placeholder = '0',
    disabled = false,
    id,
    ...props
  },
  ref
) {
  const generatedId = useId()
  const inputId = id || generatedId
  const [displayValue, setDisplayValue] = useState(() => (value || value === 0 ? formatCOP(value) : ''))

  useEffect(() => {
    if (value === '' || value === null || value === undefined) {
      setDisplayValue('')
    } else {
      const numericVal = typeof value === 'number' ? value : parseNumeric(value)
      setDisplayValue(numericVal > 0 ? formatCOP(numericVal) : (value === 0 ? '0' : ''))
    }
  }, [value])

  const handleKeyDown = (e) => {
    if (['e', 'E', '+', '-', '.'].includes(e.key)) {
      e.preventDefault()
      return
    }
    props.onKeyDown?.(e)
  }

  const handleChange = (e) => {
    const rawVal = e.target.value
    const digitsOnly = rawVal.replace(/\D/g, '')

    if (!digitsOnly) {
      setDisplayValue('')
      onChange?.({
        target: { name: props.name, value: '' },
        rawValue: '',
        numericValue: 0,
      })
      return
    }

    let numericVal = parseInt(digitsOnly, 10)
    if (maxValue !== undefined && numericVal > maxValue) {
      numericVal = maxValue
    }

    setDisplayValue(formatCOP(numericVal))
    onChange?.({
      target: { name: props.name, value: numericVal },
      rawValue: String(numericVal),
      numericValue: numericVal,
    })
  }

  const hasError = Boolean(error || errorMessage)
  const displayError = typeof error === 'string' ? error : errorMessage

  const sizeClasses = {
    sm: 'h-10 py-2 pl-8 pr-12 text-xs',
    md: 'h-11 py-2.5 pl-9 pr-14 text-xs sm:text-sm',
    lg: 'h-12 py-3 pl-10 pr-16 text-sm sm:text-base font-semibold',
  }

  return (
    <div className={`w-full ${containerClassName}`}>
      <div className="relative flex items-center">
        {prefix && (
          <span
            className="pointer-events-none absolute left-3.5 select-none font-bold text-glowe-pink-accent text-sm"
            aria-hidden="true"
          >
            {prefix}
          </span>
        )}

        <input
          {...props}
          ref={ref}
          id={inputId}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          disabled={disabled}
          value={displayValue}
          onKeyDown={handleKeyDown}
          onChange={handleChange}
          placeholder={placeholder}
          aria-invalid={hasError ? 'true' : undefined}
          className={`glass-input font-medium tracking-wide transition-all ${
            sizeClasses[size] || sizeClasses.md
          } ${
            hasError
              ? '!border-rose-400 focus:!ring-rose-200 focus:!border-rose-400 bg-rose-50/20 text-glowe-dark'
              : 'border-glowe-pink/60 hover:border-glowe-pink-dark/80 focus:border-glowe-pink-accent'
          } ${disabled ? 'opacity-60 cursor-not-allowed bg-slate-50' : ''} ${className}`}
        />

        {currency && (
          <span
            className="pointer-events-none absolute right-3 select-none text-[10px] font-bold uppercase tracking-wider text-glowe-muted bg-white/70 px-1.5 py-0.5 rounded-md border border-slate-200/60"
            aria-hidden="true"
          >
            {currency}
          </span>
        )}
      </div>

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

PriceInput.displayName = 'PriceInput'

export default PriceInput
