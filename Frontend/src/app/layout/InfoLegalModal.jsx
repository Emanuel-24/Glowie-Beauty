import { useEffect } from 'react'
import { X, ExternalLink } from 'lucide-react'
import Button from '@/shared/components/ui/Button'
import Card from '@/shared/components/ui/Card'
import { getWhatsAppUrl } from '@/shared/utils/whatsapp'

export default function InfoLegalModal({ isOpen, onClose, topic }) {
  useEffect(() => {
    if (!isOpen) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen || !topic) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="info-modal-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-glowe-dark/40 backdrop-blur-sm animate-[fadeIn_.2s_ease-out]"
      onClick={onClose}
    >
      <Card
        radius="3xl"
        className="relative w-full max-w-lg overflow-hidden border border-white/60 bg-white/95 p-6 shadow-2xl backdrop-blur-xl sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-glowe-pink/30 pb-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-glowe-pink/40 text-glowe-pink-accent text-xl">
              {topic.icon || 'ℹ️'}
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-glowe-pink-accent">
                Información Oficial
              </p>
              <h2 id="info-modal-title" className="font-serif text-lg font-bold text-glowe-dark sm:text-xl">
                {topic.title}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal informativo"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-glowe-muted hover:bg-glowe-pink/20 hover:text-glowe-dark transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glowe-pink-accent"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 max-h-[60vh] overflow-y-auto pr-1 text-xs sm:text-sm text-glowe-muted space-y-3 leading-relaxed">
          {topic.content}
        </div>

        <div className="mt-6 flex flex-col-reverse sm:flex-row items-center justify-end gap-2 border-t border-glowe-pink/30 pt-4">
          <Button variant="glass" size="sm" onClick={onClose} className="w-full sm:w-auto">
            Entendido
          </Button>
          {topic.showWhatsApp && (
            <a
              href={getWhatsAppUrl(`Hola Glowe Beauty, tengo una duda sobre ${topic.title.toLowerCase()}.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-4 py-2 transition shadow-sm hover:shadow"
            >
              <span>Consultar por WhatsApp</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </Card>
    </div>
  )
}
