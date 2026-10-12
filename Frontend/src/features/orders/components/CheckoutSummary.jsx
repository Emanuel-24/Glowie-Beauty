import Card from '@/shared/components/ui/Card'

const formatCOP = (value) => `$${Number(value || 0).toLocaleString('es-CO')}`

export default function CheckoutSummary({ items = [], subtotal = 0, shippingCost = 0, total = 0 }) {
  return (
    <aside className="lg:col-span-2" aria-label="Resumen del pedido">
      <Card className="space-y-4 p-4 sm:p-6 lg:sticky lg:top-28">
        <h2 className="font-bold text-glowe-dark text-base">Resumen del pedido</h2>
        <ul className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-3">
              <img
                src={item.image}
                alt={item.name}
                className="w-12 h-12 rounded-lg object-cover shrink-0 border border-white/60"
                loading="lazy"
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-bold text-glowe-dark truncate">{item.name}</h3>
                <span className="text-[11px] text-glowe-muted">Cantidad: {item.qty}</span>
              </div>
              <span className="shrink-0 text-xs font-semibold text-glowe-dark whitespace-nowrap">
                {formatCOP(item.price * item.qty)}
              </span>
            </li>
          ))}
        </ul>
        <div className="border-t border-glowe-pink/40 pt-3 space-y-1.5 text-sm">
          <div className="flex items-center justify-between text-glowe-muted text-xs">
            <span>Subtotal</span>
            <span className="font-semibold text-glowe-dark">{formatCOP(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between text-glowe-muted text-xs">
            <span>Envío</span>
            {shippingCost === 0 ? (
              <span className="font-bold text-emerald-600">Gratis</span>
            ) : (
              <span className="font-semibold text-glowe-dark">{formatCOP(shippingCost)}</span>
            )}
          </div>
          <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100 font-bold text-glowe-dark">
            <span className="text-sm">Total</span>
            <span className="text-base text-glowe-pink-accent">{formatCOP(total)} COP</span>
          </div>
        </div>
      </Card>
    </aside>
  )
}
