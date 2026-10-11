import { MessageCircle, RotateCcw } from 'lucide-react'
import OrderStatusBadge, { getStatusConfig } from './OrderStatusBadge'
import { getWhatsAppUrl } from '@/shared/utils/whatsapp'

const formatOrderTotal = (total) => {
  if (typeof total === 'string' && total.startsWith('$')) return total
  const num = Number(total)
  if (Number.isNaN(num)) return '$0'
  return `$${num.toLocaleString('es-CO')}`
}

const formatDisplayDate = (dateVal) => {
  if (!dateVal) return 'Fecha reciente'
  const parsed = new Date(dateVal)
  if (Number.isNaN(parsed.getTime())) return String(dateVal)
  return parsed.toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function OrderCard({ order, customerName = '', onReorder }) {
  const orderId = order.id || order._id || 'ORD'
  const displayDate = formatDisplayDate(order.date || order.createdAt)
  const displayTotal = formatOrderTotal(order.total)
  const items = Array.isArray(order.items) ? order.items : []
  const statusInfo = getStatusConfig(order.status)

  const itemsSummaryText = items
    .map((item) => {
      const name = item.name || item.title || 'Producto'
      const qty = item.quantity || item.qty || 1
      return `${qty}x ${name}`
    })
    .join(', ')

  const waMessage = [
    `¡Hola Glowe Beauty! 💖 Quiero consultar el estado de mi pedido #${orderId}.`,
    `👤 Cliente: ${customerName || 'Cliente'}`,
    `📦 Estado actual: ${statusInfo.label}`,
    itemsSummaryText ? `🛍️ Productos: ${itemsSummaryText}` : '',
    `✨ Total: ${displayTotal}`,
    '¿Me podrían brindar más información sobre la entrega? ¡Muchas gracias!',
  ]
    .filter(Boolean)
    .join('\n')

  const waLink = getWhatsAppUrl(waMessage)

  return (
    <article className="rounded-3xl border border-[#f0e3df] bg-white p-5 shadow-sm transition-all sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#f3e9e7] pb-4">
        <div>
          <h3 className="text-sm font-semibold text-[#2D2A2E]">Pedido #{orderId}</h3>
          <p className="mt-1 text-xs text-[#78716C]">{displayDate}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="flex flex-col gap-4 py-5">
        {items.map((item, index) => {
          const itemName = item.name || item.title || 'Producto Glowe'
          const itemVariant = item.variant || item.shade || item.toneName || 'Original'
          const itemQuantity = item.quantity || item.qty || 1
          const itemPrice = item.price ? formatOrderTotal(item.price) : ''
          const itemToneBg = item.tone || 'bg-[#FDE2E4]'

          return (
            <div className="flex items-center gap-3" key={`${itemName}-${index}`}>
              <div
                className={`flex size-14 shrink-0 items-center justify-center rounded-2xl ${itemToneBg} text-[10px] font-semibold tracking-widest text-[#2D2A2E]/70 shadow-inner`}
              >
                GLOWE
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[#2D2A2E]">{itemName}</p>
                <p className="mt-1 text-xs text-[#78716C]">
                  {itemVariant} <span className="mx-1">·</span> Cant. {itemQuantity}
                </p>
              </div>
              {itemPrice && <p className="text-sm font-medium text-[#2D2A2E]">{itemPrice}</p>}
            </div>
          )
        })}
      </div>

      <div className="flex flex-col gap-4 border-t border-[#f3e9e7] pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs text-[#78716C]">Total del pedido</p>
          <p className="mt-0.5 text-lg font-semibold text-[#2D2A2E]">{displayTotal}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#59b1aa] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#398f89]"
          >
            <MessageCircle className="size-4" aria-hidden="true" />
            Consultar por WhatsApp
          </a>
          <button
            type="button"
            onClick={() => onReorder && onReorder(order)}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[#eadfdb] px-4 py-2.5 text-xs font-semibold text-[#78716C] transition hover:border-[#FF758F] hover:text-[#FF758F]"
          >
            <RotateCcw className="size-3.5" aria-hidden="true" />
            Comprar de nuevo
          </button>
        </div>
      </div>
    </article>
  )
}
