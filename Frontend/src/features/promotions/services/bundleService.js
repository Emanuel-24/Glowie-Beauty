/**
 * Servicio de combos y paquetes promocionales.
 * Consume /api/bundles e integra ofertas para GlowDeals.
 */

import { apiRequest } from '@/shared/api/httpClient'
import { getProductById, getOffers } from '@/features/products/services/productService'

export const normalizeBundle = (bundle = {}) => {
  if (!bundle || typeof bundle !== 'object') return bundle

  const id = bundle.id ?? bundle._id ?? null
  const productIds = Array.isArray(bundle.productIds) ? bundle.productIds : []

  return {
    ...bundle,
    id,
    _id: bundle._id ?? id,
    name: bundle.name || 'Combo Glowe',
    desc: bundle.desc || '',
    price: Number(bundle.price || 0),
    oldPrice: bundle.oldPrice != null ? Number(bundle.oldPrice) : null,
    image: bundle.image || '',
    badge: bundle.badge || 'COMBO',
    badgeBg: bundle.badgeBg || 'bg-glowe-pink',
    badgeText: bundle.badgeText || 'text-glowe-pink-accent',
    border: bundle.border || 'border-glowe-pink/60',
    btn: bundle.btn || 'bg-glowe-pink-accent hover:bg-rose-500',
    productIds,
    isActive: Boolean(bundle.isActive !== false),
  }
}

export async function getBundles() {
  try {
    const response = await apiRequest('/bundles')
    const payload = response?.data ?? response ?? []
    const list = Array.isArray(payload) ? payload : []
    return list.map(normalizeBundle)
  } catch (error) {
    console.warn('Error al consultar /api/bundles:', error)
    return []
  }
}

export async function getBundleById(id) {
  if (!id) return null

  try {
    const response = await apiRequest(`/bundles/${id}`)
    const payload = response?.data ?? response ?? null
    if (!payload || typeof payload !== 'object') return null

    const combo = normalizeBundle(payload)

    // Si los productos ya están poblados en combo.productIds
    let items = []
    if (Array.isArray(combo.productIds) && combo.productIds.length > 0) {
      if (typeof combo.productIds[0] === 'object' && combo.productIds[0] !== null) {
        items = combo.productIds
      } else {
        const itemPromises = combo.productIds.map(async (productId) => {
          try {
            return await getProductById(productId)
          } catch {
            return null
          }
        })
        items = (await Promise.all(itemPromises)).filter(Boolean)
      }
    }

    return { combo, items }
  } catch (error) {
    console.warn(`Error al consultar combo ${id}:`, error)
    return null
  }
}

export async function createBundle(bundleData = {}) {
  const response = await apiRequest('/bundles', {
    method: 'POST',
    body: JSON.stringify(bundleData),
  })
  const payload = response?.data ?? response ?? bundleData
  return normalizeBundle(payload)
}

export async function updateBundle(id, bundleData = {}) {
  const response = await apiRequest(`/bundles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(bundleData),
  })
  const payload = response?.data ?? response ?? null
  return payload ? normalizeBundle(payload) : null
}

export async function deleteBundle(id) {
  await apiRequest(`/bundles/${id}`, { method: 'DELETE' })
  return { ok: true }
}

export async function getGlowDeals() {
  const bundleList = await getBundles()
  try {
    const offers = await getOffers()
    if (Array.isArray(offers)) {
      const featuredOffers = offers.filter((item) => Boolean(item.isFeaturedOffer))
      const targetList = featuredOffers.length > 0 ? featuredOffers.slice(0, 3) : offers.slice(0, 3)
      const deals = targetList.map((item) => {
        const discountPct =
          item.discountPercentage ||
          (item.oldPrice && item.oldPrice > item.price
            ? Math.round(((item.oldPrice - item.price) / item.oldPrice) * 100)
            : 0)
        return {
          productId: item.id || item._id,
          name: item.name,
          desc: item.desc || item.description || '',
          price: Number(item.price || 0),
          oldPrice: item.oldPrice ? Number(item.oldPrice) : Number(item.price || 0),
          discountPercentage: discountPct,
          discount: `${discountPct}% OFF`,
          image: item.image || item.images?.[0] || '',
          isFeaturedOffer: Boolean(item.isFeaturedOffer),
          offerEndDate: item.offerEndDate,
        }
      })
      return { deals, bundles: bundleList }
    }
  } catch (error) {
    console.warn('Error al consultar ofertas para GlowDeals:', error)
  }

  return { deals: [], bundles: bundleList }
}

export default {
  getBundles,
  getBundleById,
  createBundle,
  updateBundle,
  deleteBundle,
  getGlowDeals,
}
