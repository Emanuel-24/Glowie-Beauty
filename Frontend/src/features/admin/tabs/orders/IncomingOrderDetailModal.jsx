import AdminModal from '@/features/admin/components/AdminModal'
import { Button, ButtonLoading } from '@/shared/components/ui'
import { MessageCircle, CheckCircle } from 'lucide-react'
import { formatCOP } from '@/features/admin/constants'
import { getWhatsAppUrl } from '@/shared/utils/whatsapp'

export default function IncomingOrderDetailModal({
  isOpen,
  onClose,
  order,
  onConfirmOrder,
  isConfirming = false,
}) {
  if (!order) return null

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Detalle de Pedido — #${order.invoice || ''}`}
    >
      <div className="space-y-4 text-xs sm:text-sm">
        <div className="rounded-2xl border border-white/80 bg-white/75 p-4 space-y-2.5">
          <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-100">
            <div>
              <span className="text-glowe-muted block text-[10px] uppercase font-bold">Cliente</span>
              <span className="font-bold text-glowe-dark">{order.customer}</span>
              {order.customerCedula && (
                <span className="block text-[11px] text-glowe-muted">CC: {order.customerCedula}</span>
              )}
            </div>
            <div>
              <span className="text-glowe-muted block text-[10px] uppercase font-bold">Contacto</span>
              <span>{order.customerPhone || 'Sin teléfono'}</span>
              {order.customerEmail && (
                <span className="block text-[11px] text-glowe-muted truncate">{order.customerEmail}</span>
              )}
            </div>
          </div>

          <div>
            <span className="text-glowe-muted block text-[10px] uppercase font-bold">Dirección de Entrega</span>
            <span className="font-medium text-glowe-dark">{order.shippingAddress}</span>
            {(order.customerCity || order.customerDepartment) && (
              <span className="block text-[11px] text-glowe-muted">
                {[order.customerCity, order.customerDepartment].filter(Boolean).join(', ')}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
            <div>
              <span className="text-glowe-muted block text-[10px] uppercase font-bold">Método de pago</span>
              <span className="font-semibold text-glowe-dark">{order.paymentMethod}</span>
            </div>
            <div>
              <span className="text-glowe-muted block text-[10px] uppercase font-bold">Total a cobrar</span>
              <span className="font-extrabold text-glowe-pink-accent text-base">{order.total}</span>
            </div>
          </div>

          {order.notes && (
            <div className="pt-2 border-t border-slate-100">
              <span className="text-glowe-muted block text-[10px] uppercase font-bold">Notas del cliente</span>
              <p className="italic text-glowe-dark text-xs">{order.notes}</p>
            </div>
          )}
        </div>

        {order.items?.length > 0 && (
          <div className="space-y-2">
            <span className="text-glowe-muted block text-[10px] uppercase font-bold tracking-wider">Productos</span>
            <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-white/60 border border-slate-100">
                  <span className="font-medium text-glowe-dark">
                    {item.quantity || item.qty}x {item.title || item.name}
                  </span>
                  <span className="font-bold text-glowe-dark">
                    {formatCOP(Number(item.price || 0) * Number(item.quantity || item.qty || 1))}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-100">
          {order.customerPhone && (
            <a
              href={getWhatsAppUrl(`¡Hola ${order.customer}! Te escribimos de Glowe Beauty sobre tu pedido #${order.invoice}.`, order.customerPhone)}
              target="_blank"
              rel="noopener noreferrer"
              className="sm:mr-auto"
            >
              <Button variant="outline" className="text-emerald-700 border-emerald-300 gap-1.5 text-xs">
                <MessageCircle className="w-3.5 h-3.5" />
                Contactar WhatsApp
              </Button>
            </a>
          )}
          <ButtonLoading
            variant="gradient"
            loading={isConfirming}
            onClick={() => onConfirmOrder?.(order.rawId, order.invoice)}
            className="gap-1.5 text-xs font-bold"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            Confirmar pedido
          </ButtonLoading>
          <Button variant="glass" onClick={onClose} className="text-xs">
            Cerrar
          </Button>
        </div>
      </div>
    </AdminModal>
  )
}
