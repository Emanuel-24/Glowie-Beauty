export const normalizeProduct = (rawProduct) => {
  if (!rawProduct || typeof rawProduct !== 'object') return null

  const images = Array.isArray(rawProduct.images) ? rawProduct.images.filter(Boolean) : []
  const image = rawProduct.image || images[0] || ''
  const id = rawProduct.id ?? rawProduct._id ?? rawProduct.productId ?? null

  return {
    ...rawProduct,
    id,
    _id: rawProduct._id ?? id ?? null,
    name: rawProduct.name ?? rawProduct.title ?? 'Producto Glowe',
    title: rawProduct.title ?? rawProduct.name ?? 'Producto Glowe',
    brand: rawProduct.brand || 'Glowe Select',
    category: rawProduct.category ?? 'maquillaje',
    image,
    images: images.length > 0 ? images : image ? [image] : [],
    desc: rawProduct.desc ?? rawProduct.description ?? '',
    description: rawProduct.description ?? rawProduct.desc ?? '',
    tags: Array.isArray(rawProduct.tags) ? rawProduct.tags : [],
    price: Number(rawProduct.price ?? 0),
    oldPrice: rawProduct.oldPrice != null ? Number(rawProduct.oldPrice) : null,
    rating: Number(rawProduct.rating ?? 4.8),
    badge: rawProduct.badge ?? '',
  }
}

export const categoryOptionLabel = (category) => {
  if (category === 'maquillaje') return 'Maquillaje'
  if (category === 'cabello') return 'Cabello'
  return 'Descubrir'
}

export const categoryRouteFor = (category) => {
  if (category === 'maquillaje') return '/maquillaje'
  if (category === 'cabello') return '/cabello'
  return '/descubrir'
}

export const priceLabel = (value) => `$${Number(value).toLocaleString('es-CO')}`

export const discountPercent = (product) => {
  if (!product || !product.oldPrice || !product.price) return null
  return Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
}
