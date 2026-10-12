import { useState, useRef, useEffect } from 'react'
import { Bell, ShoppingBag, ArrowRight, CheckCheck, Clock } from 'lucide-react'
import { formatCOP } from '@/features/admin/constants'

export default function NotificationDropdown({
  pendingOrders = [],
  onSelectOrder,
  onNavigateToOrders,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [readOrderIds, setReadOrderIds] = useState(() => new Set())
  const dropdownRef = useRef(null)

  const unreadOrders = pendingOrders.filter(
    (order) => !readOrderIds.has(String(order.id || order.rawId || order.invoice)),
  )
  const unreadCount = unreadOrders.length

  // Cerrar al hacer clic fuera o presionar Escape
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const handleMarkAllAsRead = () => {
    const allIds = new Set(
      pendingOrders.map((o) => String(o.id || o.rawId || o.invoice)),
    )
    setReadOrderIds(allIds)
  }

  const handleItemClick = (order) => {
    setReadOrderIds((prev) => new Set(prev).add(String(order.id || order.rawId || order.invoice)))
    setIsOpen(false)
    if (onSelectOrder) {
      onSelectOrder(order)
    } else if (onNavigateToOrders) {
      onNavigateToOrders()
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón de la campanita */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/80 bg-white/70 text-base text-glowe-dark shadow-xs backdrop-blur-md transition hover:bg-white cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glowe-pink-accent"
        aria-label={`Notificaciones (${unreadCount} nuevas)`}
        title="Notificaciones de pedidos"
      >
        <Bell className="w-4 h-4 text-glowe-dark" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-black text-white shadow-xs animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Glassmorphism */}
      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 rounded-2xl border border-white/80 bg-white/95 p-4 shadow-xl backdrop-blur-xl transition-all duration-200 ease-out transform opacity-100 scale-100 translate-y-0 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-2.5">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-glowe-pink-accent" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-glowe-dark">
                Pedidos Entrantes
              </h3>
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="text-[11px] font-semibold text-glowe-blue-accent hover:underline flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Marcar leídas
              </button>
            )}
          </div>

          {/* Lista de pedidos */}
          <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
            {pendingOrders.length === 0 ? (
              <div className="py-6 text-center text-xs text-glowe-muted">
                <span className="text-xl block mb-1">✨</span>
                No hay pedidos pendientes por atender.
              </div>
            ) : (
              pendingOrders.slice(0, 6).map((order) => {
                const isUnread = !readOrderIds.has(String(order.id || order.rawId || order.invoice))
                return (
                  <div
                    key={order.id || order.invoice}
                    onClick={() => handleItemClick(order)}
                    className={`flex items-start justify-between gap-3 p-2.5 rounded-xl border transition cursor-pointer ${
                      isUnread
                        ? 'bg-pink-50/60 border-pink-200/80 hover:bg-pink-100/50'
                        : 'bg-white/60 border-slate-100 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-glowe-dark">
                          #{order.invoice || 'PEDIDO'}
                        </span>
                        {isUnread && (
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs font-semibold text-glowe-dark truncate mt-0.5">
                        {order.customer || 'Cliente Glowe'}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-glowe-muted mt-1">
                        <span className="flex items-center gap-0.5">
                          <Clock className="w-3 h-3" /> {order.date || 'Hoy'}
                        </span>
                        <span>•</span>
                        <span className="font-bold text-glowe-pink-accent">
                          {formatCOP(order.total)}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-glowe-muted shrink-0 mt-2" />
                  </div>
                )
              })
            )}
          </div>

          {/* Pie del popover */}
          {pendingOrders.length > 0 && (
            <div className="pt-2.5 mt-2.5 border-t border-slate-100 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false)
                  onNavigateToOrders?.()
                }}
                className="text-xs font-bold text-glowe-dark hover:text-glowe-pink-accent transition flex items-center justify-center gap-1 w-full"
              >
                <span>Ver todos los pedidos ({pendingOrders.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
