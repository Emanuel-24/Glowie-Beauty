import { apiRequest } from '@/shared/api/httpClient'

const normalizeCategory = (category = {}) => {
  if (!category || typeof category !== 'object') return null

  const id = category.id ?? category._id ?? null

  return {
    ...category,
    id,
    _id: category._id ?? id ?? null,
    name: category.name ?? 'Categoría',
    description: category.description ?? '',
    status: category.status ?? 'Activa',
    products: Number(category.products ?? 0),
    revenue: category.revenue ?? '$0',
  }
}

export async function getCategories() {
  const response = await apiRequest('/categories')
  const payload = response?.data ?? response ?? []
  const list = Array.isArray(payload) ? payload : Array.isArray(payload.categories) ? payload.categories : []
  return list.map((category) => normalizeCategory(category))
}

export async function createCategory(input = {}) {
  const body = {
    name: String(input.name || '').trim(),
    description: String(input.description || '').trim(),
    status: input.status || 'Activa',
  }

  const response = await apiRequest('/categories', {
    method: 'POST',
    body: JSON.stringify(body),
  })

  const payload = response?.data ?? response ?? body
  return normalizeCategory(payload)
}

export async function updateCategory(id, input = {}) {
  const response = await apiRequest(`/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      name: input.name,
      description: input.description,
      status: input.status,
    }),
  })

  const payload = response?.data ?? response ?? null
  return payload ? normalizeCategory(payload) : null
}

export async function deleteCategory(id) {
  await apiRequest(`/categories/${id}`, { method: 'DELETE' })
  return { ok: true }
}
