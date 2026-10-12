import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

/**
 * AdminModal — Componente modal base estandarizado para el panel administrativo de Glowe Beauty.
 *
 * Blindaje y control de scroll:
 * 1. Montaje raíz con ReactDOM.createPortal(modalContent, document.body).
 * 2. Bloqueo total de scroll en la página de fondo (document.body y document.documentElement).
 * 3. Compensación de scrollbarWidth para evitar saltos horizontales de layout al congelar el scroll.
 * 4. La sombra/backdrop cubre el 100% del viewport con overflow-hidden y touch-none, impidiendo cualquier
 *    movimiento o desplazamiento del contenido subyacente.
 * 5. La tarjeta modal se mantiene centrada con max-h-[90vh], aislando el scroll estrictamente dentro
 *    del cuerpo del modal con overscroll-contain (sin filtración ni arrastre hacia atrás).
 * 6. Política de persistencia: previene cierre accidental al hacer clic en el backdrop.
 */
export default function AdminModal({
  isOpen,
  onClose,
  title,
  subtitle = null,
  children,
  footer = null,
  maxWidth = 'max-w-2xl',
}) {
  useEffect(() => {
    if (!isOpen) return undefined

    const originalBodyOverflow = document.body.style.overflow
    const originalHtmlOverflow = document.documentElement.style.overflow
    const originalBodyPaddingRight = document.body.style.paddingRight

    // Calcular ancho de la barra de scroll para evitar saltos de maquetación al bloquear
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`
    }

    // Congelar completamente el scroll de la página detrás de la sombra
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose?.()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = originalBodyOverflow
      document.documentElement.style.overflow = originalHtmlOverflow
      document.body.style.paddingRight = originalBodyPaddingRight
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null
  if (typeof document === 'undefined') return null

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden overscroll-none"
      aria-hidden="false"
    >
      {/* Sombra de pantalla completa: bloquea interacción con el fondo y previene arrastres táctiles */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-all touch-none select-none"
        aria-hidden="true"
      />

      {/* Tarjeta modal centrada con scroll interno autónomo */}
      <div
        className={`relative flex max-h-[90vh] w-full ${maxWidth} flex-col overflow-hidden rounded-[2rem] border border-white/60 bg-white/95 shadow-2xl backdrop-blur-xl text-glowe-dark touch-auto overscroll-contain`}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : undefined}
      >
        {/* Header persistente con título y botón de cierre intencional */}
        <div className="flex items-center justify-between gap-3 border-b border-glowe-pink/20 px-5 py-4 sm:px-6">
          <div>
            {subtitle ? (
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-glowe-pink-accent">
                {subtitle}
              </p>
            ) : null}
            <h2 className="mt-0.5 font-serif text-xl font-bold text-glowe-dark sm:text-2xl">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200/80 bg-white/80 text-glowe-muted transition-colors hover:border-glowe-pink-accent hover:bg-white hover:text-glowe-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glowe-pink-accent cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Cuerpo scrolleable aislado para no transferir el scroll al fondo (sin barra de scroll visible) */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 overscroll-contain scrollbar-none hide-scrollbar">
          {children}
        </div>

        {/* Footer opcional para acciones de formulario adicionales */}
        {footer ? (
          <div className="border-t border-glowe-pink/20 bg-white/60 px-5 py-3 sm:px-6">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
