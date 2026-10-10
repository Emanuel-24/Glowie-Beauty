/**
 * Servicio de combos y paquetes promocionales (FASE 7B).
 * Consume bundles.fixture.js y se integra con ofertas de products.
 */

import { bundles } from '@/features/promotions/fixtures/bundles.fixture'
import { getProductById, getOffers } from '@/features/products/services/productService'

export async function getBundles() {
  return Promise.resolve([...bundles])
}

export async function getBundleById(id) {
  const combo = bundles.find((b) => b.id === id && b.type === 'COMBO')
  if (!combo) return null

  const itemPromises = (combo.productIds || []).map(async (productId) => {
    try {
      const product = await getProductById(productId)
      return product
    } catch {
      return null
    }
  })

  const items = (await Promise.all(itemPromises)).filter(Boolean)
  return { combo, items }
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
  getGlowDeals,
}
