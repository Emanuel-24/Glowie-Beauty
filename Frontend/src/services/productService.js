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
    isOffer: Boolean(product.isOffer || (product.oldPrice != null && Number(product.oldPrice) > Number(product.price))),
    discountPercentage: Number(
      product.discountPercentage ||
        (product.oldPrice != null && Number(product.oldPrice) > Number(product.price)
          ? Math.round(((Number(product.oldPrice) - Number(product.price)) / Number(product.oldPrice)) * 100)
          : 0)
    ),
    offerStartDate: product.offerStartDate || null,
    offerEndDate: product.offerEndDate || null,
    isFeaturedOffer: Boolean(product.isFeaturedOffer),
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
  const body = {
    ...input,
    brand: input.brand !== undefined ? input.brand : undefined,
    price: input.price !== undefined ? Number(input.price ?? 0) : undefined,
    oldPrice: input.oldPrice !== undefined ? (input.oldPrice === null ? null : Number(input.oldPrice)) : undefined,
    stock: input.stock !== undefined ? Number(input.stock ?? 0) : undefined,
    tags: Array.isArray(input.tags) ? input.tags : undefined,
    isRecommended: input.isRecommended !== undefined ? Boolean(input.isRecommended) : undefined,
    recommendedOrder: input.recommendedOrder !== undefined ? Number(input.recommendedOrder ?? 0) : undefined,
    isOffer: input.isOffer !== undefined ? Boolean(input.isOffer) : undefined,
    discountPercentage: input.discountPercentage !== undefined ? Number(input.discountPercentage) : undefined,
    offerStartDate: input.offerStartDate !== undefined ? input.offerStartDate : undefined,
    offerEndDate: input.offerEndDate !== undefined ? input.offerEndDate : undefined,
    isFeaturedOffer: input.isFeaturedOffer !== undefined ? Boolean(input.isFeaturedOffer) : undefined,
  }

  // Clean undefined keys
  Object.keys(body).forEach((key) => body[key] === undefined && delete body[key])

  const response = await apiRequest(`/products/${productId}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  })

  const payload = response?.data ?? response ?? null
  return payload ? normalizeProduct(payload) : null
}

export async function getOffers() {
  try {
    const response = await apiRequest('/products/offers')
    const payload = response?.data ?? response ?? []
    const list = Array.isArray(payload) ? payload : Array.isArray(payload.offers) ? payload.offers : []
    return list.map(normalizeProduct)
  } catch (err) {
    console.warn('Fallback local para ofertas:', err)
    const all = await getProducts()
    return all.filter((p) => p.isOffer || (p.oldPrice != null && p.oldPrice > p.price))
  }
}

export async function updateProductOffer(productId, offerData = {}) {
  return updateProduct(productId, {
    isOffer: Boolean(offerData.isOffer),
    price: offerData.price !== undefined ? Number(offerData.price) : undefined,
    oldPrice: offerData.oldPrice !== undefined ? (offerData.oldPrice === null ? null : Number(offerData.oldPrice)) : undefined,
    discountPercentage: offerData.discountPercentage !== undefined ? Number(offerData.discountPercentage) : undefined,
    offerStartDate: offerData.offerStartDate !== undefined ? offerData.offerStartDate : undefined,
    offerEndDate: offerData.offerEndDate !== undefined ? offerData.offerEndDate : undefined,
    isFeaturedOffer: offerData.isFeaturedOffer !== undefined ? Boolean(offerData.isFeaturedOffer) : undefined,
  })
}

export async function batchUpdateFeaturedOffers({ offerEndDate, productIds = null } = {}) {
  const response = await apiRequest('/products/batch-offers', {
    method: 'PATCH',
    body: JSON.stringify({ offerEndDate, productIds }),
  })
  const payload = response?.data ?? response ?? []
  const list = Array.isArray(payload) ? payload : []
  return list.map(normalizeProduct)
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

export async function getTopSellerProduct() {
  const response = await apiRequest('/products/top-seller')
  const payload = response?.data ?? response ?? null
  if (payload && typeof payload === 'object') return normalizeProduct(payload)
  return null
}
