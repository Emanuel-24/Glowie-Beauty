import { useState, useCallback } from 'react'
import { useCart } from '@/features/cart'
import { useAuth } from '@/features/auth'
import { useToast } from '@/shared/toast'
import { getOrderWhatsAppUrl } from '@/shared/utils/whatsapp'
import { createOrder } from '@/features/orders/services/orderService'

const generateOrderId = () =>
  `GLOWE-${Math.random().toString(36).slice(2, 8).toUpperCase()}`

export function useCheckout() {
  const { items, subtotal, shippingCost, total, clearCart } = useCart()
  const { user, addOrder } = useAuth()
  const { showToast } = useToast()
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState(null)

  const processOrder = useCallback(
    async ({ form, paymentMethod = 'efectivo' }) => {
      setSubmitting(true)
      setError(null)
      try {
        const orderId = generateOrderId()
        const customerName = form.fullName.trim() || 'cliente'
        const orderPayload = {
          orderId,
          items: items.map((item) => ({
            id: item.id,
            name: item.name,
            image: item.image,
            price: item.price,
            qty: item.qty,
          })),
          subtotal,
          shippingCost,
          total,
          customer: {
            fullName: customerName,
            email: form.email.trim(),
            phone: form.phone.trim(),
            address: form.address.trim(),
            city: form.city.trim(),
            department: form.department?.trim() || '',
          },
          paymentMethod,
          userId: user?.id ?? null,
        }

        await createOrder(orderPayload)

        const orderBrief = {
          id: orderId,
          createdAt: new Date().toISOString(),
          total,
          status: 'Confirmado',
          items: items.map((item) => `${item.qty}x ${item.name}`),
          customer: customerName,
        }

        const whatsappUrl = getOrderWhatsAppUrl({
          orderId,
          customerName,
          items,
          total,
          paymentMethod,
          address: form.address.trim(),
          city: form.city.trim(),
        })

        addOrder(orderBrief)
        clearCart()
        const result = { id: orderId, customerName, whatsappUrl }
        setSuccess(result)
        return result
      } catch (err) {
        const errMsg = err?.message || 'No pudimos procesar tu pedido. Revisa tus datos e inténtalo de nuevo.'
        setError(errMsg)
        showToast('No pudimos procesar tu pedido', 'Revisa tus datos e inténtalo de nuevo.')
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
