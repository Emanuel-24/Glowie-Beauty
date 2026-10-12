import { useState, useEffect, useMemo } from 'react'
import AdminModal from '@/features/admin/components/AdminModal'
import { Button, ButtonLoading, PriceInput, useConfirm } from '@/shared/components/ui'
import StatusBadge from '@/features/admin/components/StatusBadge'
import { formatCOP } from '@/features/admin/constants'
import { updateOrder } from '@/features/orders/services/orderService'
import { useToast } from '@/shared/toast'
import { useUnsavedChangesWarning } from '@/shared/hooks/useUnsavedChangesWarning'
import { Clock, Truck, CheckCircle2, Check, Ban, Plus, Trash2, ChevronDown } from 'lucide-react'

const STATUS_OPTIONS = [
  { value: 'Confirmada', label: 'Confirmada', tone: 'info', icon: Clock },
  { value: 'En preparación', label: 'En preparación', tone: 'info', icon: Clock },
  { value: 'En camino', label: 'En camino', tone: 'warning', icon: Truck },
  { value: 'Entregado', label: 'Entregado', tone: 'success', icon: CheckCircle2 },
  { value: 'Completada', label: 'Completada', tone: 'success', icon: Check },
  { value: 'Anulada', label: 'Anulada', tone: 'danger', icon: Ban },
]

export default function EditSaleModal({
  isOpen,
  onClose,
  order = null,
  products = [],
  onSaveSuccess,
}) {
  const { showToast } = useToast()
  const confirm = useConfirm()

  const [status, setStatus] = useState('Confirmada')
  const [items, setItems] = useState([])
  const [shippingCost, setShippingCost] = useState(0)
  const [selectedProductId, setSelectedProductId] = useState('')
  const [liquidateOnSave, setLiquidateOnSave] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useUnsavedChangesWarning(Boolean(isOpen && items.length > 0))

  useEffect(() => {
    if (order) {
      setStatus(order.status || 'Confirmada')
      setShippingCost(Number(order.shippingCost ?? 0))
      setLiquidateOnSave(false)
      const initialItems = Array.isArray(order.items)
        ? order.items.map((it) => ({
            productId: it.productId || it.id,
            title: it.title || it.name || 'Producto Glowe',
            price: Number(it.price || 0),
            quantity: Number(it.quantity ?? it.qty ?? 1),
            image: it.image || '',
          }))
        : []
      setItems(initialItems)
      if (products.length > 0) {
        setSelectedProductId(String(products[0].id ?? products[0]._id))
      }
    }
  }, [order, products])

  const subtotal = useMemo(
    () => items.reduce((sum, it) => sum + Number(it.price || 0) * Number(it.quantity || 1), 0),
    [items],
  )
  const total = useMemo(() => subtotal + Number(shippingCost || 0), [subtotal, shippingCost])
  const initialAmountPaid = Number(order?.amountPaid || 0)
  const amountPaid = liquidateOnSave ? total : Math.min(total, initialAmountPaid)
  const balance = liquidateOnSave ? 0 : Math.max(0, total - amountPaid)

  const handleStatusClick = async (newStatus) => {
    if (newStatus === status) return

    if (newStatus === 'Completada' && balance > 0) {
      const ok = await confirm({
        type: 'warning',
        title: '¿Completar venta con saldo pendiente?',
        message:
          'Al marcar esta venta como Completada, el saldo pendiente quedará en $0 COP y la venta figurará como pagada. ¿Deseas continuar?',
        confirmText: 'Sí, liquidar y completar',
        cancelText: 'Cancelar',
      })
      if (!ok) return
      setLiquidateOnSave(true)
    } else if (newStatus !== 'Completada') {
      setLiquidateOnSave(false)
    }

    setStatus(newStatus)
  }

  const handleQuantityChange = (index, delta) => {
    setItems((prev) => prev.map((it, idx) => idx === index ? { ...it, quantity: Math.max(1, (it.quantity || 1) + delta) } : it))
  }

  const handleRemoveItem = (index) => {
    if (items.length <= 1) {
      showToast('No se puede vaciar', 'La venta debe conservar al menos 1 producto o ser anulada.', '⚠️')
      return
    }
    setItems((prev) => prev.filter((_, idx) => idx !== index))
  }

  const handleAddProduct = () => {
    const prod = products.find((p) => String(p.id ?? p._id) === String(selectedProductId))
    if (!prod) return

    setItems((prev) => {
      const existingIdx = prev.findIndex((it) => String(it.productId) === String(prod.id ?? prod._id))
      if (existingIdx >= 0) {
        return prev.map((it, idx) =>
          idx === existingIdx ? { ...it, quantity: (it.quantity || 1) + 1 } : it,
        )
      }
      return [
        ...prev,
        {
          productId: prod.id ?? prod._id,
          title: prod.name || 'Producto Glowe',
          price: Number(prod.price || 0),
          quantity: 1,
          image: prod.image || prod.images?.[0] || '',
        },
      ]
    })
    showToast('Producto añadido', `Se agregó "${prod.name}" a la venta.`, '✨')
  }

  const handleSave = async (e) => {
    e.preventDefault()
    const targetId = order?.rawId || order?.id
    if (!targetId) return

    setIsSaving(true)
    try {
      const payload = {
        items,
        subtotal,
        shippingCost: Number(shippingCost || 0),
        total,
        status,
        amountPaid,
        balance,
        paymentStatus: balance <= 0 ? 'Pagada' : amountPaid > 0 ? 'Abonada' : 'Sin pagos',
        liquidateBalance: liquidateOnSave,
      }

      const res = await updateOrder(targetId, payload)
      showToast('Venta actualizada', `La venta #${order.invoice} fue guardada exitosamente.`, '✅')
      onSaveSuccess?.({ ...order, ...payload, ...res })
      onClose()
    } catch (err) {
      showToast('Error', err.message || 'No se pudo guardar la venta.', '❌')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Editar Venta #${order?.invoice || ''}`}
      subtitle="Recalcular productos, envío y estado de entrega"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSave} className="space-y-4 text-xs sm:text-sm">
        {/* Sección: Estado de la Venta (Tracking en tienda) */}
        <div className="rounded-2xl border border-white/80 bg-white/70 p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-glowe-muted">
              Estado de la Venta (Tracking en tienda)
            </span>
            <StatusBadge label={status} tone={status === 'Completada' ? 'success' : status === 'Anulada' ? 'danger' : 'info'} />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {STATUS_OPTIONS.map((st) => {
              const isCurrent = status === st.value
              const Icon = st.icon
              return (
                <button
                  key={st.value}
                  type="button"
                  onClick={() => handleStatusClick(st.value)}
                  className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-[11px] font-bold transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-glowe-dark text-white shadow-xs'
                      : 'border border-slate-200/80 bg-white/80 text-glowe-muted hover:border-glowe-pink/60 hover:text-glowe-dark'
                  }`}
                >
                  <Icon className="h-3 w-3" />
                  <span>{st.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Sección: Añadir productos adicionales del catálogo */}
        <div className="rounded-2xl border border-white/80 bg-white/70 p-3.5 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-glowe-muted block">
            Añadir producto adicional del catálogo
          </span>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full h-10 appearance-none rounded-xl border border-white/80 bg-white/90 pl-3.5 pr-8 text-xs font-semibold text-glowe-dark shadow-xs backdrop-blur-md focus:border-glowe-pink-accent focus:outline-none"
              >
                {products.map((p) => (
                  <option key={p.id ?? p._id} value={p.id ?? p._id}>
                    {p.name} — {formatCOP(p.price)}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-glowe-muted" />
            </div>
            <button
              type="button"
              onClick={handleAddProduct}
              className="inline-flex items-center gap-1 rounded-xl bg-glowe-dark text-white px-3.5 text-xs font-bold hover:bg-black transition cursor-pointer shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" /> Añadir
            </button>
          </div>
        </div>

        {/* Sección: Desglose y edición de productos */}
        <div className="rounded-2xl border border-white/80 bg-white/70 p-3.5 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-glowe-muted block">
            Productos de la Venta ({items.length})
          </span>
          <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
            {items.map((it, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-white/90 border border-slate-100">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  {it.image ? (
                    <img src={it.image} alt={it.title} className="h-9 w-9 rounded-lg object-cover bg-slate-100 shrink-0" />
                  ) : (
                    <div className="h-9 w-9 rounded-lg bg-pink-50 flex items-center justify-center text-xs text-glowe-pink-accent font-bold shrink-0">✨</div>
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-glowe-dark truncate text-xs">{it.title}</p>
                    <p className="text-[10px] text-glowe-muted">Unitario: {formatCOP(it.price)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                    <button type="button" onClick={() => handleQuantityChange(idx, -1)} className="px-2 py-0.5 text-xs font-bold hover:bg-slate-200 rounded-l-lg">-</button>
                    <span className="px-2 text-xs font-bold text-glowe-dark">{it.quantity}</span>
                    <button type="button" onClick={() => handleQuantityChange(idx, 1)} className="px-2 py-0.5 text-xs font-bold hover:bg-slate-200 rounded-r-lg">+</button>
                  </div>
                  <span className="font-bold text-glowe-dark text-xs w-20 text-right">{formatCOP(it.price * it.quantity)}</span>
                  <button type="button" onClick={() => handleRemoveItem(idx)} title="Remover de la venta" className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg transition">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sección: Costo de Envío y Totales */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/80 bg-white/70 p-3.5 space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-glowe-muted block">
              Costo de Envío (COP)
            </label>
            <PriceInput
              value={shippingCost}
              onChange={(val) => setShippingCost(Number(val) || 0)}
              placeholder="0"
              className="w-full text-xs font-bold text-glowe-dark"
            />
          </div>

          <div className="rounded-2xl border border-white/80 bg-white/70 p-3 space-y-1 text-xs">
            <div className="flex justify-between text-glowe-muted"><span>Subtotal:</span><span className="font-semibold">{formatCOP(subtotal)}</span></div>
            <div className="flex justify-between text-glowe-muted"><span>Envío:</span><span className="font-semibold">{formatCOP(shippingCost)}</span></div>
            <div className="flex justify-between text-glowe-dark font-extrabold border-t border-slate-100 pt-1"><span>Total Venta:</span><span className="text-glowe-pink-accent">{formatCOP(total)}</span></div>
            <div className="flex justify-between text-amber-800 font-extrabold"><span>Saldo por Pagar:</span><span>{formatCOP(balance)}</span></div>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-2">
          <Button variant="glass" type="button" onClick={onClose} disabled={isSaving}>Cancelar</Button>
          <ButtonLoading variant="gradient" type="submit" loading={isSaving} className="font-bold">Guardar venta</ButtonLoading>
        </div>
      </form>
    </AdminModal>
  )
}
