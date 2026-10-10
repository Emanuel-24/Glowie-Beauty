import { apiRequest } from '@/shared/api/httpClient'

export async function getUsers() {
  const response = await apiRequest('/users')
  const payload = response?.data ?? response ?? []
  return Array.isArray(payload) ? payload : []
}

export async function createUser(userData = {}) {
  const response = await apiRequest('/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  })

  const payload = response?.data ?? response ?? userData
  return { ok: true, data: payload }
}

export async function updateUser(id, userData = {}) {
  const response = await apiRequest(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  })

  const payload = response?.data ?? response ?? { id, ...userData }
  return { ok: true, data: payload }
}

export async function deleteUser(id) {
  const response = await apiRequest(`/users/${id}`, { method: 'DELETE' })
  if (response?.success === false) return { ok: false, error: response?.message || 'No se pudo eliminar el usuario' }
  return { ok: true, data: response?.data ?? { id } }
}
