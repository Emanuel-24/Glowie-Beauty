import { apiRequest } from './api'

const normalizeTag = (tag = {}) => {
  if (!tag || typeof tag !== 'object') return null

  const id = tag.id ?? tag._id ?? null

  return {
    ...tag,
    id,
    _id: tag._id ?? id ?? null,
    name: tag.name ?? '',
    slug: tag.slug ?? '',
    description: tag.description ?? '',
    products: Number(tag.products ?? 0),
  }
}

export async function getTags() {
  const response = await apiRequest('/tags')
  const payload = response?.data ?? response ?? []
  const list = Array.isArray(payload) ? payload : []
  return list.map((tag) => normalizeTag(tag))
}

export async function createTag(input = {}) {
  const body = {
    name: String(input.name || '').trim(),
    description: String(input.description || '').trim(),
  }

  const response = await apiRequest('/tags', {
    method: 'POST',
    body: JSON.stringify(body),
  })

  const payload = response?.data ?? response ?? body
  return normalizeTag(payload)
}

export async function deleteTag(id) {
  await apiRequest(`/tags/${id}`, { method: 'DELETE' })
  return { ok: true }
}
