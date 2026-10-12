import { useState, useMemo, useEffect } from 'react'
import AdminModal from '@/features/admin/components/AdminModal'
import { Button, ButtonLoading, Input, PriceInput } from '@/shared/components/ui'
import { createPayment } from '@/features/admin/services/paymentService'
import { formatCOP } from '@/features/admin/constants'
import { useToast } from '@/shared/toast'
import { useUnsavedChangesWarning } from '@/shared/hooks/useUnsavedChangesWarning'
import { ChevronDown } from 'lucide-react'

const PAYMENT_METHODS = [
  { value: 'Transferencia', label: 'Transferencia bancaria / Nequi' },
  { value: 'Efectivo', label: 'Efectivo en caja' },
  { value: 'Tarjeta', label: 'Tarjeta débito / crédito' },
  { value: 'Otro', label: 'Otro medio' },
]

export default function RegisterPaymentModal({
  isOpen,
  onClose,
  purchases = [],
  onPaymentRegistered,
  initialOrderId = null,
}) {
  const { showToast } = useToast()
  const [selectedOrderId, setSelectedOrderId] = useState('')
  const [amount, setAmount] = useState(0)
  const [method, setMethod] = useState('Transferencia')
  const [reference, setReference] = useState('')
  const [note, setNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useUnsavedChangesWarning(Boolean(isOpen && selectedOrderId && amount > 0))

  const eligibleOrders = useMemo(() => {
    return purchases
      .filter((p) => p.status !== 'Anulada' && (Number(p.totalValue ?? p.total ?? 0) - Number(p.amountPaid || 0) > 0))
      .map((p) => {
        const total = Number(p.totalValue ?? p.total ?? 0)
        const paid = Number(p.amountPaid || 0)
        return { id: p.id ?? p._id, invoice: p.invoice || 'ORDEN', customer: p.customer || 'Cliente', total, amountPaid: paid, balance: Math.max(0, total - paid) }
      })
  }, [purchases])

  useEffect(() => {
    if (isOpen) {
      const targetId = initialOrderId ? String(initialOrderId) : (eligibleOrders.length > 0 ? String(eligibleOrders[0].id) : '')
      const ord = eligibleOrders.find((o) => String(o.id) === targetId) || (eligibleOrders.length > 0 ? eligibleOrders[0] : null)
      if (ord) { setSelectedOrderId(String(ord.id)); setAmount(ord.balance); }
      else { setSelectedOrderId(''); setAmount(0); }
      setReference(`COMP-${Date.now().toString().slice(-6)}`)
      setNote('')
    }
  }, [isOpen, eligibleOrders, initialOrderId])

  const selectedOrder = useMemo(() => eligibleOrders.find((o) => String(o.id) === String(selectedOrderId)) || null, [eligibleOrders, selectedOrderId])

  const handleOrderChange = (e) => {
    const id = e.target.value
    setSelectedOrderId(id)
    const ord = eligibleOrders.find((o) => String(o.id) === String(id))
    if (ord) setAmount(ord.balance)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedOrder) {
      showToast('Selecciona una orden', 'Debes elegir la venta a la cual abonar.', '⚠️')
      return
    }

    const val = Number(amount)
    if (!val || val < 1000) {
      showToast('Monto mínimo requerido', 'El abono mínimo permitido es de $1.000 COP.', '⚠️')
      return
    }

    if (val > selectedOrder.balance) {
      showToast('Monto excedido', `El abono no puede superar el saldo pendiente de ${formatCOP(selectedOrder.balance)}.`, '⚠️')
      return
    }

    setIsSubmitting(true)
    try {
      const payload = { orderId: selectedOrder.id, amount: val, method, reference: reference.trim(), note: note.trim() || 'Abono registrado desde el panel administrativo' }
      const res = await createPayment(payload)
      const saved = res?.payment ?? res
      showToast('Abono registrado', `Se abonaron ${formatCOP(val)} a la orden #${selectedOrder.invoice}.`, '✅')
      onPaymentRegistered?.({
        payment: {
          id: saved.id ?? `pay-${Date.now()}`,
          orderId: selectedOrder.id,
          invoice: selectedOrder.invoice,
          customer: selectedOrder.customer,
          amount: val,
          balance: Math.max(0, selectedOrder.balance - val),
          method,
          reference: reference.trim(),
          status: 'Confirmado',
          statusTone: 'success',
          createdAt: new Date().toISOString(),
        },
        orderId: selectedOrder.id,
        abonoAmount: val,
      })
      onClose()
    } catch (err) {
      showToast('Error', err.message || 'No se pudo registrar el abono.', '❌')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title="Registrar Abono a Venta"
      subtitle="Control de cartera y cobranza"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
        {eligibleOrders.length === 0 ? (
          <div className="py-8 text-center text-glowe-muted space-y-2">
            <span className="text-3xl block">🎉</span>
            <p className="font-semibold text-glowe-dark text-sm">No hay ventas con saldo pendiente</p>
            <p className="text-xs">Todas las órdenes registradas están al día o no tienen pagos a crédito pendientes.</p>
          </div>
        ) : (
          <>
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-glowe-muted">
                Seleccionar Venta / Factura <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={selectedOrderId}
                  onChange={handleOrderChange}
                  className="w-full h-10 appearance-none rounded-xl border border-white/80 bg-white/80 backdrop-blur-md pl-4 pr-10 text-xs font-semibold text-glowe-dark shadow-xs focus:border-glowe-pink-accent focus:outline-none cursor-pointer"
                >
                  {eligibleOrders.map((ord) => (
                    <option key={ord.id} value={ord.id}>
                      #{ord.invoice} — {ord.customer} (Pendiente: {formatCOP(ord.balance)})
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-glowe-muted" />
              </div>
            </div>

            {selectedOrder && (
              <div className="rounded-2xl border border-white/80 bg-white/70 p-3.5 space-y-2">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-xl bg-white/80 border border-slate-100">
                    <span className="text-[10px] font-bold uppercase text-glowe-muted block">Total Venta</span>
                    <span className="font-bold text-glowe-dark">{formatCOP(selectedOrder.total)}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200">
                    <span className="text-[10px] font-bold uppercase text-emerald-800 block">Ya Abonado</span>
                    <span className="font-bold text-emerald-700">{formatCOP(selectedOrder.amountPaid)}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-amber-50 border border-amber-300">
                    <span className="text-[10px] font-bold uppercase text-amber-900 block">Saldo Actual</span>
                    <span className="font-black text-amber-800">{formatCOP(selectedOrder.balance)}</span>
                  </div>
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-glowe-muted">
                  Monto del Abono (COP) <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] text-glowe-muted">Mínimo: $1.000 COP</span>
              </div>
              <PriceInput
                value={amount}
                onChange={(e) => setAmount(Number(e?.numericValue ?? e?.target?.value ?? e) || 0)}
                placeholder="1000"
                className="w-full text-sm font-bold text-emerald-700"
              />
              {selectedOrder && (
                <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                  <span className="text-[10px] text-glowe-muted">Sugeridos:</span>
                  <button
                    type="button"
                    onClick={() => setAmount(Math.min(1000, selectedOrder.balance))}
                    className="px-2 py-0.5 rounded-lg border border-slate-200 bg-white/70 text-[10px] font-bold text-glowe-dark hover:border-glowe-pink-accent cursor-pointer"
                  >
                    Mínimo ($1.000)
                  </button>
                  {selectedOrder.balance > 2000 && (
                    <button
                      type="button"
                      onClick={() => setAmount(Math.round(selectedOrder.balance / 2))}
                      className="px-2 py-0.5 rounded-lg border border-slate-200 bg-white/70 text-[10px] font-bold text-glowe-dark hover:border-glowe-pink-accent cursor-pointer"
                    >
                      50% ({formatCOP(Math.round(selectedOrder.balance / 2))})
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setAmount(selectedOrder.balance)}
                    className="px-2 py-0.5 rounded-lg border border-slate-200 bg-white/70 text-[10px] font-bold text-glowe-dark hover:border-glowe-pink-accent cursor-pointer"
                  >
                    Total ({formatCOP(selectedOrder.balance)})
                  </button>
                </div>
              )}
              {selectedOrder && amount > selectedOrder.balance && (
                <p className="mt-1 text-[11px] font-semibold text-rose-500">
                  El monto excede el saldo pendiente ({formatCOP(selectedOrder.balance)}).
                </p>
              )}
              {amount > 0 && amount < 1000 && (
                <p className="mt-1 text-[11px] font-semibold text-rose-500">
                  El abono mínimo es de $1.000 COP.
                </p>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-glowe-muted">
                  Método de Pago <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    className="w-full h-10 appearance-none rounded-xl border border-white/80 bg-white/80 backdrop-blur-md pl-3.5 pr-8 text-xs font-semibold text-glowe-dark shadow-xs focus:border-glowe-pink-accent focus:outline-none cursor-pointer"
                  >
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-glowe-muted" />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-glowe-muted">
                  Comprobante / Referencia
                </label>
                <Input
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="Número de comprobante..."
                  className="text-xs"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-glowe-muted">
                Observación o Nota de Cobranza
              </label>
              <Input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ej. Abono 50% acordado por WhatsApp..."
                className="text-xs"
              />
            </div>
          </>
        )}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-2">
          <Button variant="glass" type="button" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          {eligibleOrders.length > 0 && (
            <ButtonLoading
              variant="gradient"
              type="submit"
              loading={isSubmitting}
              disabled={isSubmitting || !amount || (selectedOrder && amount > selectedOrder.balance)}
              className="font-bold"
            >
              Confirmar abono 💵
            </ButtonLoading>
          )}
        </div>
      </form>
    </AdminModal>
  )
}
