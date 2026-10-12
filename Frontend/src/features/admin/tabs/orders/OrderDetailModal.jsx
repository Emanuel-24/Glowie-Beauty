import AdminModal from '@/features/admin/components/AdminModal'
import { Button } from '@/shared/components/ui'
import StatusBadge from '@/features/admin/components/StatusBadge'
import { MessageCircle, FileText } from 'lucide-react'
import { formatCOP } from '@/features/admin/constants'
import { getWhatsAppUrl } from '@/shared/utils/whatsapp'

export default function OrderDetailModal({
  isOpen,
  onClose,
  order = null,
  orderPayments = [],
}) {
  if (!order) return null

  const total = Number(order.totalValue ?? order.total ?? 0)
  const amountPaid = Number(order.amountPaid ?? 0)
  const balance = Math.max(0, total - amountPaid)

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Detalle de Venta — #${order.invoice || ''}`}
      subtitle="Consulta de despacho, notas y cobranza"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4 text-xs sm:text-sm">
        {/* Cabecera de Estado Informativo */}
        <div className="flex items-center justify-between rounded-2xl border border-white/80 bg-white/70 px-4 py-3">
          <span className="text-xs font-semibold text-glowe-muted">Estado actual de la venta</span>
          <StatusBadge label={order.status} tone={order.statusTone} />
        </div>

        {/* Ficha Cliente & Entrega */}
        <div className="rounded-2xl border border-white/80 bg-white/70 p-4 space-y-2.5">
          <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-glowe-muted block">Cliente</span>
              <p className="font-bold text-glowe-dark">{order.customer}</p>
              {order.customerCedula && <p className="text-[11px] text-glowe-muted">CC: {order.customerCedula}</p>}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-glowe-muted block">Contacto</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{order.customerPhone || 'Sin teléfono'}</span>
                {order.customerPhone && (
                  <a
                    href={getWhatsAppUrl(`¡Hola ${order.customer}! Te contactamos de Glowe Beauty con respecto a tu orden #${order.invoice}.`, order.customerPhone)}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Chatear por WhatsApp"
                    className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
              {order.customerEmail && <p className="text-[11px] text-glowe-muted truncate">{order.customerEmail}</p>}
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-glowe-muted block">Dirección de despacho</span>
            <p className="font-medium text-glowe-dark">{order.shippingAddress}</p>
            {(order.customerCity || order.customerDepartment) && (
              <p className="text-[11px] text-glowe-muted">
                {[order.customerCity, order.customerDepartment].filter(Boolean).join(', ')}
              </p>
            )}
          </div>
        </div>

        {/* Instrucciones Especiales de Entrega */}
        <div className="rounded-2xl border border-white/80 bg-white/70 p-3.5 space-y-1.5">
          <div className="flex items-center gap-1.5 text-glowe-muted">
            <FileText className="h-3.5 w-3.5 text-glowe-pink-accent" />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Instrucciones Especiales de Entrega
            </span>
          </div>
          <p className="text-xs text-glowe-dark font-medium bg-white/80 p-2.5 rounded-xl border border-slate-100">
            {order.notes ? order.notes : 'Sin instrucciones especiales registradas.'}
          </p>
        </div>

        {/* Desglose de Productos */}
        {order.items?.length > 0 && (
          <div className="rounded-2xl border border-white/80 bg-white/70 p-4 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-glowe-muted block">
              Productos ({order.items.length})
            </span>
            <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
              {order.items.map((it, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-white/80 border border-slate-100">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {it.image ? (
                      <img src={it.image} alt={it.title} className="h-9 w-9 rounded-lg object-cover bg-slate-100 shrink-0" />
                    ) : (
                      <div className="h-9 w-9 rounded-lg bg-pink-50 flex items-center justify-center text-xs text-glowe-pink-accent font-bold shrink-0">
                        ✨
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-glowe-dark truncate text-xs">{it.title || it.name}</p>
                      <p className="text-[10px] text-glowe-muted">
                        Cant: {it.quantity || it.qty} • Unitario: {formatCOP(it.price)}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-glowe-dark text-xs shrink-0 ml-2">
                    {formatCOP(Number(it.price || 0) * Number(it.quantity || it.qty || 1))}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resumen Financiero y Abonos */}
        <div className="rounded-2xl border border-white/80 bg-white/70 p-4 space-y-2">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-xl bg-white/80 border border-slate-100">
              <span className="text-[10px] font-bold uppercase text-glowe-muted block">Total Venta</span>
              <span className="font-extrabold text-glowe-dark text-sm sm:text-base">{formatCOP(total)}</span>
            </div>
            <div className="p-2 rounded-xl bg-emerald-50/80 border border-emerald-200">
              <span className="text-[10px] font-bold uppercase text-emerald-800 block">Total Abonado</span>
              <span className="font-extrabold text-emerald-700 text-sm sm:text-base">{formatCOP(amountPaid)}</span>
            </div>
            <div className={`p-2 rounded-xl border ${balance > 0 ? 'bg-amber-50/80 border-amber-300' : 'bg-slate-50 border-slate-200'}`}>
              <span className={`text-[10px] font-bold uppercase block ${balance > 0 ? 'text-amber-900' : 'text-slate-500'}`}>
                Saldo Pendiente
              </span>
              <span className={`font-extrabold text-sm sm:text-base ${balance > 0 ? 'text-amber-800 font-black' : 'text-slate-500'}`}>
                {formatCOP(balance)}
              </span>
            </div>
          </div>

          {/* Historial de Abonos si aplica */}
          {orderPayments.length > 0 && (
            <div className="pt-2 border-t border-slate-100 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-glowe-muted block">
                Historial de Abonos Registrados
              </span>
              <div className="space-y-1 max-h-28 overflow-y-auto">
                {orderPayments.map((pay) => (
                  <div key={pay.id} className="flex items-center justify-between p-2 rounded-xl bg-white/60 text-xs">
                    <div>
                      <span className="font-bold text-emerald-700">{formatCOP(pay.amount)}</span>
                      <span className="text-[10px] text-glowe-muted ml-2">({pay.method}) • Ref: {pay.reference || '—'}</span>
                    </div>
                    <span className="text-[10px] text-slate-500">{pay.createdAt ? new Date(pay.createdAt).toLocaleDateString('es-CO') : 'Reciente'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="glass" onClick={onClose} className="text-xs">
            Cerrar
          </Button>
        </div>
      </div>
    </AdminModal>
  )
}
