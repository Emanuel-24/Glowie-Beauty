import { apiRequest } from './api'

const normalizeProduct = (product = {}) => {
  if (!product || typeof product !== 'object') return product

  const images = Array.isArray(product.images) ? product.images.filter(Boolean) : []
  const image = product.image || images[0] || ''
  const id = product.id ?? product._id ?? product.productId ?? null

  return {
    ...product,
    id,
    _id: product._id ?? id ?? null,
    name: product.name ?? product.title ?? 'Producto Glowe',
    title: product.title ?? product.name ?? 'Producto Glowe',
    brand: product.brand || 'Glowe Select',
    image,
    images: images.length > 0 ? images : image ? [image] : [],
    desc: product.desc ?? product.description ?? '',
    description: product.description ?? product.desc ?? '',
    category: product.category ?? 'maquillaje',
    price: Number(product.price ?? 0),
    oldPrice: product.oldPrice != null ? Number(product.oldPrice) : null,
    stock: Number(product.stock ?? 0),
    tags: Array.isArray(product.tags) ? product.tags : [],
    isRecommended: Boolean(product.isRecommended),
    recommendedOrder: Number(product.recommendedOrder ?? 0),
  }
}

export async function getProducts() {
  const response = await apiRequest('/products')
  const payload = response?.data ?? response ?? []
  const list = Array.isArray(payload) ? payload : Array.isArray(payload.products) ? payload.products : []
  return list.map(normalizeProduct)
}

export async function createProduct(input = {}) {
  const body = {
    name: input.name || 'Producto Glowe',
    title: input.title || input.name || 'Producto Glowe',
    brand: input.brand || 'Glowe Select',
    category: input.category || 'maquillaje',
    price: Number(input.price ?? 0),
    oldPrice: input.oldPrice != null ? Number(input.oldPrice) : null,
    stock: Number(input.stock ?? 12),
    image: input.image || '',
    images: Array.isArray(input.images) ? input.images.filter(Boolean) : [],
    desc: input.desc || input.description || '',
    description: input.description || input.desc || '',
    tags: Array.isArray(input.tags) ? input.tags.map(String) : [],
    badge: input.badge || 'Nuevo',
    rating: Number(input.rating ?? 4.8),
    isRecommended: Boolean(input.isRecommended),
    recommendedOrder: Number(input.recommendedOrder ?? 0),
  }

  const response = await apiRequest('/products', {
    method: 'POST',
    body: JSON.stringify(body),
  })

  const payload = response?.data ?? response ?? body
  return normalizeProduct(payload)
}

export async function updateProduct(productId, input = {}) {
  const response = await apiRequest(`/products/${productId}`, {
    method: 'PUT',
    body: JSON.stringify({
      ...input,
      brand: input.brand !== undefined ? input.brand : undefined,
      price: Number(input.price ?? 0),
      stock: Number(input.stock ?? 0),
      isRecommended: Boolean(input.isRecommended),
      recommendedOrder: Number(input.recommendedOrder ?? 0),
    }),
  })

  const payload = response?.data ?? response ?? null
  return payload ? normalizeProduct(payload) : null
}

export async function deleteProduct(productId) {
  await apiRequest(`/products/${productId}`, { method: 'DELETE' })
  return { ok: true }
}

export async function getProductById(productId) {
  if (!productId) return null

  const response = await apiRequest(`/products/${productId}`)
  const payload = response?.data ?? response ?? null
  if (payload && typeof payload === 'object') return normalizeProduct(payload)

  return null
}
