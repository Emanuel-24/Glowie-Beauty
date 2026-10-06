import { apiRequest } from './api'

export async function createOrder(orderData = {}) {
  const response = await apiRequest('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData),
  })

  const payload = response?.data ?? response ?? orderData
  return { ok: true, data: payload }
}

export async function getOrders() {
  const response = await apiRequest('/orders')
  const payload = response?.data ?? response ?? []
  return Array.isArray(payload) ? payload : []
}

export async function updateOrder(id, orderData = {}) {
  const response = await apiRequest(`/orders/${id}`, {
    method: 'PUT',
    body: JSON.stringify(orderData),
  })

  const payload = response?.data ?? response ?? { id, ...orderData }
  return { ok: true, data: payload }
}

export async function deleteOrder(id) {
  const response = await apiRequest(`/orders/${id}`, { method: 'DELETE' })
  if (response?.success === false) return { ok: false, error: response?.message || 'No se pudo eliminar la orden' }
  return { ok: true, data: response?.data ?? { id } }
}

export async function getUserOrders() {
  const response = await apiRequest('/orders')
  const payload = response?.data ?? response ?? []
  if (Array.isArray(payload)) return payload
  if (Array.isArray(response?.orders)) return response.orders
  return []
}
