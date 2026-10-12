import { useState, useCallback } from 'react'
import { useCart } from '@/features/cart'
import { useAuth } from '@/features/auth'
import { useToast } from '@/shared/toast'
import { getOrderWhatsAppUrl } from '@/shared/utils/whatsapp'
import { createOrder } from '@/features/orders/services/orderService'

const generateOrderId = () =>
  `FAC-${Math.random().toString(36).slice(2, 8).toUpperCase()}`

export function useCheckout() {
  const { items, subtotal, shippingCost, total, clearCart } = useCart()
  const { user, addOrder } = useAuth()
  const { showToast } = useToast()
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState(null)

  const processOrder = useCallback(
    async ({ form, paymentMethod = 'contra_entrega' }) => {
      setSubmitting(true)
      setError(null)
      try {
        const orderId = generateOrderId()
        const customerName = form.fullName.trim() || user?.name || 'Cliente Glowe'
        const orderPayload = {
          orderId,
          items: items.map((item) => ({
            id: item.id,
            productId: item.id,
            name: item.name,
            title: item.name,
            image: item.image,
            price: Number(item.price || 0),
            qty: Number(item.qty || 1),
            quantity: Number(item.qty || 1),
          })),
          subtotal: Number(subtotal || 0),
          shippingCost: Number(shippingCost || 0),
          total: Number(total || 0),
          customer: {
            fullName: customerName,
            cedula: form.cedula?.trim() || '',
            email: form.email.trim(),
            phone: form.phone.trim(),
            address: form.address.trim(),
            city: form.city.trim(),
            department: form.department?.trim() || '',
          },
          shippingAddress: `${form.address.trim()}, ${form.city.trim()}`,
          paymentMethod,
          notes: form.notes?.trim() || '',
          userId: user?.id ?? null,
        }

        const res = await createOrder(orderPayload)
        const createdOrder = res?.data || {}
        const finalInvoice = createdOrder.invoice || orderId

        const whatsappUrl = getOrderWhatsAppUrl({
          orderId: finalInvoice,
          customerName,
          items,
          total,
          paymentMethod,
          address: form.address.trim(),
          city: form.city.trim(),
        })

        const orderBrief = {
          id: finalInvoice,
          createdAt: new Date().toISOString(),
          total,
          status: 'Pendiente',
          items: items.map((item) => `${item.qty}x ${item.name}`),
          customer: customerName,
        }

        if (typeof addOrder === 'function') {
          addOrder(orderBrief)
        }
        clearCart()

        const result = {
          id: finalInvoice,
          customerName,
          total,
          date: new Date().toLocaleDateString('es-CO'),
          paymentMethod,
          whatsappUrl,
          items,
        }
        setSuccess(result)
        showToast('¡Pedido recibido!', 'Tu compra ha sido registrada con éxito.', '✨')
        return result
      } catch (err) {
        const errMsg = err?.message || 'No pudimos procesar tu pedido. Revisa tus datos e inténtalo de nuevo.'
        setError(errMsg)
        showToast('No pudimos procesar tu pedido', errMsg)
        throw err
      } finally {
        setSubmitting(false)
      }
    },
    [items, subtotal, shippingCost, total, clearCart, user, addOrder, showToast],
  )

  return {
    items,
    subtotal,
    shippingCost,
    total,
    user,
    submitting,
    success,
    error,
    processOrder,
    setSuccess,
  }
}

export default useCheckout
