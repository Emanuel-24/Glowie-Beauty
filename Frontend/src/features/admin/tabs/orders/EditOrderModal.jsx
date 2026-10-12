import { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import AdminModal from '@/features/admin/components/AdminModal'
import { Button, ButtonLoading, Input } from '@/shared/components/ui'
import { updateOrder } from '@/features/orders/services/orderService'
import { useToast } from '@/shared/toast'
import { useUnsavedChangesWarning } from '@/shared/hooks/useUnsavedChangesWarning'

const PAYMENT_METHODS = [
  { value: 'contra_entrega', label: 'Contra entrega' },
  { value: 'abono', label: 'Abono / Crédito' },
  { value: 'transferencia_completa', label: 'Transferencia completa' },
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'tarjeta', label: 'Tarjeta' },
  { value: 'nequi', label: 'Nequi / Daviplata' },
]

export default function EditOrderModal({
  isOpen,
  onClose,
  order = null,
  onSaveSuccess,
}) {
  const { showToast } = useToast()
  const [formData, setFormData] = useState({
    customer: '',
    customerPhone: '',
    customerEmail: '',
    shippingAddress: '',
    customerCity: '',
    customerDepartment: '',
    paymentMethod: 'contra_entrega',
    notes: '',
  })
  const [isSaving, setIsSaving] = useState(false)

  useUnsavedChangesWarning(Boolean(isOpen && formData.customer))

  useEffect(() => {
    if (order) {
      setFormData({
        customer: order.customer || '',
        customerPhone: order.customerPhone || '',
        customerEmail: order.customerEmail || '',
        shippingAddress: order.shippingAddress || '',
        customerCity: order.customerCity || '',
        customerDepartment: order.customerDepartment || '',
        paymentMethod: order.rawPaymentMethod || order.paymentMethod || 'contra_entrega',
        notes: order.notes || '',
      })
    }
  }, [order])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!order?.rawId && !order?.id) return

    if (!formData.customer.trim()) {
      showToast('Campo requerido', 'El nombre del cliente no puede estar vacío.', '⚠️')
      return
    }

    if (!formData.shippingAddress.trim()) {
      showToast('Campo requerido', 'La dirección de entrega es obligatoria.', '⚠️')
      return
    }

    setIsSaving(true)
    try {
      const targetId = order.rawId || order.id
      const res = await updateOrder(targetId, formData)
      showToast('Pedido actualizado', `Los datos del pedido #${order.invoice} fueron corregidos.`, '✨')
      onSaveSuccess?.({ ...order, ...formData, ...res })
      onClose()
    } catch (err) {
      showToast('Error', err.message || 'No se pudieron actualizar los datos del pedido.', '❌')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Editar Pedido #${order?.invoice || ''}`}
      subtitle="Corrección de datos antes de confirmar"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-glowe-muted">
              Nombre del cliente <span className="text-rose-500">*</span>
            </label>
            <Input
              name="customer"
              value={formData.customer}
              onChange={handleChange}
              placeholder="Nombre completo"
              required
              className="text-xs"
            />
          </div>

          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-glowe-muted">
              Teléfono de contacto
            </label>
            <Input
              name="customerPhone"
              value={formData.customerPhone}
              onChange={handleChange}
              placeholder="300 123 4567"
              className="text-xs"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-glowe-muted">
            Correo electrónico
          </label>
          <Input
            name="customerEmail"
            type="email"
            value={formData.customerEmail}
            onChange={handleChange}
            placeholder="cliente@ejemplo.com"
            className="text-xs"
          />
        </div>

        <div>
          <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-glowe-muted">
            Dirección de entrega <span className="text-rose-500">*</span>
          </label>
          <Input
            name="shippingAddress"
            value={formData.shippingAddress}
            onChange={handleChange}
            placeholder="Calle / Carrera / Apto"
            required
            className="text-xs"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-glowe-muted">
              Ciudad
            </label>
            <Input
              name="customerCity"
              value={formData.customerCity}
              onChange={handleChange}
              placeholder="Medellín / Bogotá / etc."
              className="text-xs"
            />
          </div>

          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-glowe-muted">
              Departamento
            </label>
            <Input
              name="customerDepartment"
              value={formData.customerDepartment}
              onChange={handleChange}
              placeholder="Antioquia / Cundinamarca"
              className="text-xs"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-glowe-muted">
            Método de pago acordado
          </label>
          <div className="relative">
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              className="w-full appearance-none rounded-xl border border-glowe-pink/40 bg-white/70 py-2.5 pl-3.5 pr-9 text-xs font-semibold text-glowe-dark shadow-xs backdrop-blur-md transition hover:bg-white/90 focus:border-glowe-pink-accent focus:bg-white focus:outline-none"
            >
              {PAYMENT_METHODS.map((method) => (
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-glowe-muted" />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-glowe-muted">
            Notas u observaciones de despacho
          </label>
          <textarea
            name="notes"
            rows={2}
            value={formData.notes}
            onChange={handleChange}
            placeholder="Indicaciones para el domiciliario o transportadora..."
            className="w-full rounded-2xl border border-glowe-pink/60 bg-white/80 p-3 text-xs text-glowe-dark focus:border-glowe-pink-accent focus:outline-none"
          />
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-2">
          <Button variant="glass" type="button" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <ButtonLoading variant="gradient" type="submit" loading={isSaving} className="font-bold">
            Guardar cambios
          </ButtonLoading>
        </div>
      </form>
    </AdminModal>
  )
}
