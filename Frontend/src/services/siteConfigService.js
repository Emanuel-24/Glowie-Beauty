import { apiRequest } from './api'

export const defaultSiteConfig = {
  heroConfig: {
    featuredProductId: null,
    featuredProduct: null,
    floatingBadgeText: '✨ ¡Nuevo producto!',
    tagline: 'RUTINA COMPLETA',
    title: 'Glow Natural Everyday',
  },
  communityConfig: [
    {
      id: 'comm-1',
      imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
      title: '@sofia_glowe',
      link: 'https://instagram.com/GloweBeautyCO',
    },
    {
      id: 'comm-2',
      imageUrl: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=600&q=80',
      title: '@camila_beauty',
      link: 'https://instagram.com/GloweBeautyCO',
    },
    {
      id: 'comm-3',
      imageUrl: 'https://placehold.co/400x400/FDE2E4/FF758F?text=Glowe',
      title: '@valentina_hair',
      link: 'https://instagram.com/GloweBeautyCO',
    },
    {
      id: 'comm-4',
      imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80',
      title: '@mariana_style',
      link: 'https://instagram.com/GloweBeautyCO',
    },
  ],
}

const normalizeSiteConfig = (config = {}) => {
  if (!config || typeof config !== 'object') return defaultSiteConfig

  const hero = config.heroConfig || {}
  return {
    id: config.id ?? config._id ?? 'site-config',
    _id: config._id ?? config.id ?? 'site-config',
    heroConfig: {
      featuredProductId: hero.featuredProductId ?? null,
      featuredProduct: hero.featuredProduct ?? null,
      floatingBadgeText: hero.floatingBadgeText ?? defaultSiteConfig.heroConfig.floatingBadgeText,
      tagline: hero.tagline ?? defaultSiteConfig.heroConfig.tagline,
      title: hero.title ?? defaultSiteConfig.heroConfig.title,
    },
    communityConfig: Array.isArray(config.communityConfig) && config.communityConfig.length > 0
      ? config.communityConfig.map((item, index) => ({
          id: item.id ?? item._id ?? `comm-${index}`,
          _id: item._id ?? item.id ?? `comm-${index}`,
          imageUrl: item.imageUrl || '',
          title: item.title || '',
          link: item.link || '',
        }))
      : defaultSiteConfig.communityConfig,
  }
}

export async function getSiteConfig() {
  try {
    const response = await apiRequest('/site-config')
    const payload = response?.data ?? response ?? null
    return payload ? normalizeSiteConfig(payload) : defaultSiteConfig
  } catch {
    return defaultSiteConfig
  }
}

export async function updateSiteConfig(input = {}) {
  const body = {
    heroConfig: input.heroConfig ? {
      featuredProductId: input.heroConfig.featuredProductId || null,
      floatingBadgeText: input.heroConfig.floatingBadgeText || '',
      tagline: input.heroConfig.tagline || '',
      title: input.heroConfig.title || '',
    } : undefined,
    communityConfig: Array.isArray(input.communityConfig) ? input.communityConfig : undefined,
  }

  const response = await apiRequest('/site-config', {
    method: 'PUT',
    body: JSON.stringify(body),
  })

  const payload = response?.data ?? response ?? null
  return payload ? normalizeSiteConfig(payload) : defaultSiteConfig
}
