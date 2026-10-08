import SiteConfig from '../models/SiteConfig.js';
import Product from '../models/Product.js';
import { normalizeProduct } from './productService.js';

export const normalizeSiteConfig = (config = {}) => {
  const hero = config.heroConfig || {};
  let featuredProduct = null;
  if (hero.featuredProductId && typeof hero.featuredProductId === 'object' && hero.featuredProductId.name) {
    featuredProduct = normalizeProduct(hero.featuredProductId);
  }

  return {
    id: config.id ?? config._id?.toString?.() ?? 'site-config',
    _id: config._id?.toString?.() ?? config.id ?? 'site-config',
    heroConfig: {
      featuredProductId: hero.featuredProductId?._id?.toString?.() ?? hero.featuredProductId ?? null,
      featuredProduct,
      floatingBadgeText: hero.floatingBadgeText ?? '✨ ¡Nuevo producto!',
      tagline: hero.tagline ?? 'RUTINA COMPLETA',
      title: hero.title ?? 'Glow Natural Everyday',
    },
    communityConfig: Array.isArray(config.communityConfig)
      ? config.communityConfig.map((item) => ({
          id: item.id ?? item._id?.toString?.() ?? null,
          _id: item._id?.toString?.() ?? item.id ?? null,
          imageUrl: item.imageUrl || '',
          title: item.title || '',
          link: item.link || '',
        }))
      : [],
    updatedAt: config.updatedAt ?? new Date(),
  };
};

export const getSiteConfigRecord = async () => {
  let config = await SiteConfig.findOne().populate('heroConfig.featuredProductId').lean();

  if (!config) {
    // Si no existe, creamos el documento inicial por defecto
    const created = await SiteConfig.create({});
    config = await SiteConfig.findById(created._id).populate('heroConfig.featuredProductId').lean();
  }

  return normalizeSiteConfig(config);
};

export const updateSiteConfigRecord = async (payload = {}) => {
  let config = await SiteConfig.findOne();

  if (!config) {
    config = new SiteConfig();
  }

  if (payload.heroConfig) {
    const hero = payload.heroConfig;
    if (hero.featuredProductId !== undefined) {
      config.heroConfig.featuredProductId = hero.featuredProductId || null;
    }
    if (hero.floatingBadgeText !== undefined) {
      config.heroConfig.floatingBadgeText = String(hero.floatingBadgeText).trim();
    }
    if (hero.tagline !== undefined) {
      config.heroConfig.tagline = String(hero.tagline).trim();
    }
    if (hero.title !== undefined) {
      config.heroConfig.title = String(hero.title).trim();
    }
  }

  if (Array.isArray(payload.communityConfig)) {
    config.communityConfig = payload.communityConfig.map((item) => ({
      imageUrl: String(item.imageUrl || '').trim(),
      title: String(item.title || '').trim(),
      link: String(item.link || '').trim(),
    }));
  }

  await config.save();

  const populated = await SiteConfig.findById(config._id).populate('heroConfig.featuredProductId').lean();
  return normalizeSiteConfig(populated);
};
