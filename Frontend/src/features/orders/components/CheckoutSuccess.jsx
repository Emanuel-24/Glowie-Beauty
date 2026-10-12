import { useEffect } from 'react'
import { Check, MessageCircle, Store, ArrowRight, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Button from '@/shared/components/ui/Button'
import Card from '@/shared/components/ui/Card'

const formatCOP = (value) => `$${Number(value || 0).toLocaleString('es-CO')}`

export default function CheckoutSuccess({ success }) {
  const navigate = useNavigate()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [])

  if (!success) return null

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <Card className="max-w-lg w-full p-6 sm:p-8 text-center space-y-6 shadow-[0_20px_50px_rgba(255,117,143,0.12)] border border-white/80">
        <div className="relative mx-auto w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center shadow-inner">
          <Check className="w-8 h-8 text-emerald-600" aria-hidden="true" />
          <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-glowe-pink-accent text-white shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
          </span>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-glowe-pink-accent">
            Confirmación de Compra
          </p>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-glowe-dark">
            ¡Pedido Recibido! ✨
          </h1>
          <p className="text-sm text-glowe-muted">
            Muchas gracias, <strong className="text-glowe-dark">{success.customerName}</strong>. Tu pedido ha sido registrado exitosamente en nuestro sistema.
          </p>
        </div>

        {/* Resumen visual de la orden */}
        <div className="rounded-2xl border border-white/90 bg-white/60 p-4 text-left space-y-2.5 text-sm backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-glowe-muted uppercase tracking-wider">Código de Orden:</span>
            <span className="font-mono text-sm font-bold text-glowe-dark bg-white px-2.5 py-0.5 rounded-lg border border-slate-200 shadow-2xs">
              #{success.id}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-glowe-muted uppercase tracking-wider">Fecha:</span>
            <span className="text-xs font-semibold text-glowe-dark">{success.date || 'Hoy'}</span>
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 pt-2">
            <span className="text-xs font-bold text-glowe-dark uppercase tracking-wider">Total a pagar:</span>
            <span className="text-base font-extrabold text-glowe-pink-accent">
              {formatCOP(success.total)} COP
            </span>
          </div>
        </div>

        <p className="text-xs text-glowe-muted leading-relaxed">
          Haz clic en el botón a continuación para enviar los detalles de tu orden a nuestro WhatsApp oficial y coordinar el despacho con nuestras asesoras:
        </p>

        {/* Botón principal grande WhatsApp */}
        <div className="space-y-3 pt-1">
          {success.whatsappUrl && (
            <a
              href={success.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full"
            >
              <button
                type="button"
                className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-2xl font-bold text-white text-base shadow-[0_10px_25px_rgba(16,185,129,0.35)] bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                <MessageCircle className="w-5 h-5 shrink-0 fill-current" />
                <span>Enviar pedido a WhatsApp</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>
            </a>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
            <Button
              variant="glass"
              fullWidth
              onClick={() => navigate('/descubrir')}
              className="text-xs font-semibold flex items-center justify-center gap-2"
            >
              <Store className="w-3.5 h-3.5" />
              Volver a la tienda
            </Button>
            <Button
              variant="outline"
              fullWidth
              onClick={() => navigate('/perfil')}
              className="text-xs font-semibold"
            >
              Ver mis compras
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
