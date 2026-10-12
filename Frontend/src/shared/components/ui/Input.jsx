import { forwardRef } from 'react'

const sizes = {
  sm: 'min-h-10 px-4 py-2 text-xs',
  md: 'min-h-11 px-5 py-3 text-xs',
}

const Input = forwardRef(function Input(
  {
    size = 'md',
    className = '',
    error = false,
    errorMessage = '',
    helperText = '',
    containerClassName = '',
    ...props
  },
  ref,
) {
  const hasError = Boolean(error || errorMessage)
  const displayError = typeof error === 'string' ? error : errorMessage

  const errorClasses = hasError
    ? '!border-rose-400 focus:!ring-rose-200 focus:!border-rose-400 bg-rose-50/20 text-glowe-dark'
    : ''

  const inputElement = (
    <input
      ref={ref}
      aria-invalid={hasError ? 'true' : undefined}
      className={`glass-input ${sizes[size] || sizes.md} ${errorClasses} ${className}`}
      {...props}
    />
  )

  if (!displayError && !helperText) {
    return inputElement
  }

  return (
    <div className={`w-full ${containerClassName}`}>
      {inputElement}
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

Input.displayName = 'Input'

export default Input
