import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import { AlertCircle, AlertTriangle, CheckCircle2, HelpCircle, Info, Trash2, X } from 'lucide-react'
import Button from './Button'
import ButtonLoading from './ButtonLoading'

const ConfirmContext = createContext(null)

const DIALOG_CONFIGS = {
  danger: {
    icon: Trash2,
    iconWrapperClass: 'bg-rose-50 text-rose-500 border border-rose-200/80 shadow-rose-100',
    confirmButtonVariant: 'primary',
    confirmButtonClass: '!bg-rose-500 hover:!bg-rose-600 !text-white shadow-rose-200/50',
    defaultConfirmText: 'Eliminar',
    defaultCancelText: 'Cancelar',
    badgeText: 'Acción Destructiva',
    badgeClass: 'text-rose-600 bg-rose-50 border-rose-200/60',
  },
  warning: {
    icon: AlertTriangle,
    iconWrapperClass: 'bg-amber-50 text-amber-600 border border-amber-200/80 shadow-amber-100',
    confirmButtonVariant: 'primary',
    confirmButtonClass: '!bg-amber-500 hover:!bg-amber-600 !text-white shadow-amber-200/50',
    defaultConfirmText: 'Continuar',
    defaultCancelText: 'Cancelar',
    badgeText: 'Atención',
    badgeClass: 'text-amber-700 bg-amber-50 border-amber-200/60',
  },
  info: {
    icon: Info,
    iconWrapperClass: 'bg-sky-50 text-sky-600 border border-sky-200/80 shadow-sky-100',
    confirmButtonVariant: 'primary',
    confirmButtonClass: '!bg-sky-600 hover:!bg-sky-700 !text-white shadow-sky-200/50',
    defaultConfirmText: 'Aceptar',
    defaultCancelText: 'Cancelar',
    badgeText: 'Información',
    badgeClass: 'text-sky-700 bg-sky-50 border-sky-200/60',
  },
  edit: {
    icon: AlertCircle,
    iconWrapperClass: 'bg-glowe-pink/60 text-glowe-pink-accent border border-glowe-pink shadow-pink-100',
    confirmButtonVariant: 'gradient',
    confirmButtonClass: '',
    defaultConfirmText: 'Guardar cambios',
    defaultCancelText: 'Descartar',
    badgeText: 'Confirmación',
    badgeClass: 'text-glowe-pink-accent bg-glowe-pink/40 border-glowe-pink/60',
  },
  success: {
    icon: CheckCircle2,
    iconWrapperClass: 'bg-emerald-50 text-emerald-600 border border-emerald-200/80 shadow-emerald-100',
    confirmButtonVariant: 'primary',
    confirmButtonClass: '!bg-emerald-600 hover:!bg-emerald-700 !text-white shadow-emerald-200/50',
    defaultConfirmText: 'Entendido',
    defaultCancelText: 'Cerrar',
    badgeText: 'Éxito',
    badgeClass: 'text-emerald-700 bg-emerald-50 border-emerald-200/60',
  },
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  type = 'warning',
  title = '¿Confirmar acción?',
  message = '¿Estás seguro de que deseas continuar con esta operación?',
  confirmText,
  cancelText,
  confirmVariant,
  showCancel = true,
  isLoading = false,
}) {
  const config = DIALOG_CONFIGS[type] || DIALOG_CONFIGS.warning
  const IconComponent = config.icon || HelpCircle
  const finalConfirmText = confirmText || config.defaultConfirmText
  const finalCancelText = cancelText || config.defaultCancelText

  useEffect(() => {
    if (!isOpen) return undefined

    const originalOverflow = document.body.style.overflow
    const originalHtmlOverflow = document.documentElement.style.overflow
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`
    }
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isLoading) {
        onClose?.()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = originalOverflow
      document.documentElement.style.overflow = originalHtmlOverflow
      document.body.style.paddingRight = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, isLoading, onClose])

  if (!isOpen || typeof document === 'undefined') return null

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden overscroll-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-desc"
    >
      <div
        className="absolute inset-0 bg-black/45 backdrop-blur-sm transition-all duration-300 touch-none select-none"
        onClick={() => {
          if (!isLoading) onClose?.()
        }}
        aria-hidden="true"
      />

      <div
        className="relative flex w-full max-w-md flex-col overflow-hidden rounded-3xl border border-white/80 bg-white/95 p-6 shadow-2xl backdrop-blur-xl text-glowe-dark transition-all duration-200 transform scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          aria-label="Cerrar diálogo"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-slate-200/80 bg-white/80 text-glowe-muted transition-colors hover:border-glowe-pink hover:text-glowe-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glowe-pink-accent cursor-pointer disabled:opacity-50"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-4 pr-6">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-sm ${config.iconWrapperClass}`}
          >
            <IconComponent className="h-6 w-6 stroke-[2.2]" />
          </div>

          <div className="min-w-0 flex-1">
            <span
              className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${config.badgeClass}`}
            >
              {config.badgeText}
            </span>
            <h3
              id="confirm-dialog-title"
              className="mt-1 font-serif text-lg font-bold text-glowe-dark leading-tight"
            >
              {title}
            </h3>
            <p
              id="confirm-dialog-desc"
              className="mt-2 text-xs text-glowe-muted leading-relaxed break-words"
            >
              {message}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
          {showCancel && (
            <Button
              variant="glass"
              size="sm"
              disabled={isLoading}
              onClick={onClose}
              className="w-full sm:w-auto text-xs"
            >
              {finalCancelText}
            </Button>
          )}

          <ButtonLoading
            variant={confirmVariant || config.confirmButtonVariant}
            size="sm"
            loading={isLoading}
            onClick={onConfirm}
            className={`w-full sm:w-auto text-xs font-bold ${config.confirmButtonClass}`}
          >
            {finalConfirmText}
          </ButtonLoading>
        </div>
      </div>
    </div>,
    document.body
  )
}

export function ConfirmProvider({ children }) {
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    options: {},
    isLoading: false,
  })

  const resolverRef = useRef(null)

  const confirm = useCallback((options = {}) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve
      setDialogState({
        isOpen: true,
        options,
        isLoading: false,
      })
    })
  }, [])

  const handleClose = useCallback(() => {
    if (resolverRef.current) {
      resolverRef.current(false)
      resolverRef.current = null
    }
    setDialogState((prev) => ({ ...prev, isOpen: false, isLoading: false }))
  }, [])

  const handleConfirm = useCallback(async () => {
    if (typeof dialogState.options.onConfirmAction === 'function') {
      try {
        setDialogState((prev) => ({ ...prev, isLoading: true }))
        await dialogState.options.onConfirmAction()
      } catch (err) {
        setDialogState((prev) => ({ ...prev, isLoading: false }))
        throw err
      }
    }

    if (resolverRef.current) {
      resolverRef.current(true)
      resolverRef.current = null
    }
    setDialogState((prev) => ({ ...prev, isOpen: false, isLoading: false }))
  }, [dialogState.options])

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <ConfirmDialog
        isOpen={dialogState.isOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
        isLoading={dialogState.isLoading}
        type={dialogState.options.type || 'warning'}
        title={dialogState.options.title}
        message={dialogState.options.message}
        confirmText={dialogState.options.confirmText}
        cancelText={dialogState.options.cancelText}
        confirmVariant={dialogState.options.confirmVariant}
        showCancel={dialogState.options.showCancel ?? true}
      />
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const context = useContext(ConfirmContext)
  if (!context) {
    throw new Error('useConfirm debe usarse dentro de un <ConfirmProvider>')
  }
  return context.confirm
}

export default ConfirmDialog
