import { apiRequest } from '@/shared/api/httpClient'

export async function getPayments() {
  const response = await apiRequest('/payments')
  const payload = response?.data ?? response ?? []
  return Array.isArray(payload) ? payload : []
}

export async function getOrderPayments(orderId) {
  const response = await apiRequest(`/payments/order/${orderId}`)
  return response?.data ?? response ?? { order: null, payments: [] }
}

export async function createPayment(paymentData = {}) {
  const response = await apiRequest('/payments', {
    method: 'POST',
    body: JSON.stringify(paymentData),
  })

  return response?.data ?? response ?? paymentData
}

export async function cancelPayment(paymentId) {
  const response = await apiRequest(`/payments/${paymentId}/anular`, {
    method: 'PUT',
  })

  return response?.data ?? response ?? { id: paymentId }
}
