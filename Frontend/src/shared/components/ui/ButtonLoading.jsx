import { useState } from 'react'
import Button from './Button'

/**
 * ButtonLoading — Botón interactivo con protección contra doble clic / doble envío.
 * 
 * Características:
 * - Al activarse el estado `loading` o al ejecutar `onClick` asíncrono, se deshabilita
 *   inmediatamente (`disabled` y `pointer-events-none`) evitando ejecuciones concurrentes.
 * - Soporta resolución automática de promesas en `onClick`.
 * - Renderiza un spinner compacto y fluido sin romper el ancho o estructura visual.
 * - Soporta todas las variantes de Button (primary, glass, soft, gradient, dark, etc.).
 */
export default function ButtonLoading({
  children,
  onClick,
  loading: externalLoading = false,
  loadingText,
  disabled = false,
  className = '',
  spinnerPlacement = 'start', // 'start' | 'end' | 'replace'
  ...props
}) {
  const [internalLoading, setInternalLoading] = useState(false)

  const isLoading = Boolean(externalLoading || internalLoading)
  const isDisabled = Boolean(disabled || isLoading)

  const handleClick = async (event) => {
    if (isDisabled) {
      event.preventDefault()
      return
    }

    if (onClick) {
      try {
        const result = onClick(event)
        // Si el handler devuelve una promesa, activar bloqueo interno automáticamente
        if (result && typeof result.then === 'function') {
          setInternalLoading(true)
          await result
        }
      } catch (error) {
        throw error
      } finally {
        setInternalLoading(false)
      }
    }
  }

  const spinner = (
    <span
      key="spinner"
      aria-hidden="true"
      className="inline-block h-3.5 w-3.5 shrink-0 rounded-full border-2 border-current border-t-transparent animate-spin opacity-90"
    />
  )

  const renderContent = () => {
    if (isLoading && spinnerPlacement === 'replace') {
      return (
        <span className="inline-flex items-center gap-2">
          {spinner}
          {loadingText ? <span>{loadingText}</span> : null}
        </span>
      )
    }

    if (isLoading && spinnerPlacement === 'start') {
      return (
        <>
          {spinner}
          <span>{loadingText || children}</span>
        </>
      )
    }

    if (isLoading && spinnerPlacement === 'end') {
      return (
        <>
          <span>{loadingText || children}</span>
          {spinner}
        </>
      )
    }

    return children
  }

  return (
    <Button
      {...props}
      disabled={isDisabled}
      aria-busy={isLoading ? 'true' : undefined}
      className={`relative transition-all duration-200 select-none ${
        isLoading ? 'pointer-events-none cursor-not-allowed opacity-75' : ''
      } ${className}`}
      onClick={handleClick}
    >
      {renderContent()}
    </Button>
  )
}
