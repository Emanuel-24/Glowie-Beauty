import Product from '../models/Product.js';

export const normalizeProduct = (product = {}) => {
  if (!product || typeof product !== 'object') return product;

  const normalizedImages = Array.isArray(product.images) ? product.images.filter(Boolean) : [];
  const image = product.image || normalizedImages[0] || '';

  return {
    ...product,
    id: product.id ?? product._id?.toString?.() ?? null,
    _id: product._id?.toString?.() ?? product.id ?? null,
    name: product.name ?? product.title ?? 'Producto Glowe',
    title: product.title ?? product.name ?? 'Producto Glowe',
    brand: product.brand || 'Glowe Select',
    category: product.category ?? 'maquillaje',
    image,
    images: normalizedImages.length > 0 ? normalizedImages : image ? [image] : [],
    price: Number(product.price ?? 0),
    oldPrice: product.oldPrice != null ? Number(product.oldPrice) : null,
    stock: Number(product.stock ?? 0),
    tags: Array.isArray(product.tags) ? product.tags : [],
    desc: product.desc ?? product.description ?? '',
    description: product.description ?? product.desc ?? '',
    isRecommended: Boolean(product.isRecommended),
    recommendedOrder: Number(product.recommendedOrder ?? 0),
  };
};

export const getAllProducts = async () => {
  const products = await Product.find({}).lean();
  return products.map(normalizeProduct);
};

export const getProductByIdRecord = async (id) => {
  const product = await Product.findById(id).lean();
  if (!product) {
    const error = new Error('Producto no encontrado');
    error.statusCode = 404;
    throw error;
  }
  return normalizeProduct(product);
};

export const createProductRecord = async (payload = {}) => {
  const nextProduct = {
    name: String(payload.name || '').trim() || 'Producto Glowe',
    title: String(payload.title || payload.name || 'Producto Glowe').trim(),
    brand: String(payload.brand || 'Glowe Select').trim(),
    category: String(payload.category || 'maquillaje').trim() || 'maquillaje',
    price: Number(payload.price ?? 0),
    oldPrice: payload.oldPrice !== undefined && payload.oldPrice !== null ? Number(payload.oldPrice) : null,
    stock: Number(payload.stock ?? 12),
    image: String(payload.image || payload.images?.[0] || '').trim(),
    images: Array.isArray(payload.images) ? payload.images.filter(Boolean).map(String) : [],
    desc: String(payload.desc || payload.description || '').trim(),
    description: String(payload.description || payload.desc || '').trim(),
    tags: Array.isArray(payload.tags) ? payload.tags.map(String) : [],
    badge: String(payload.badge || 'Nuevo').trim(),
    rating: Number(payload.rating ?? 4.8),
    isRecommended: Boolean(payload.isRecommended),
    recommendedOrder: Number(payload.recommendedOrder ?? 0),
  };

  if (!nextProduct.image && nextProduct.images.length === 0) {
    nextProduct.image = 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=500&q=80';
    nextProduct.images = [nextProduct.image];
  }

  const product = await Product.create(nextProduct);
  return normalizeProduct(product);
};

export const updateProductRecord = async (id, payload = {}) => {
  const currentProduct = await Product.findById(id);

  if (!currentProduct) {
    const error = new Error('Producto no encontrado');
    error.statusCode = 404;
    throw error;
  }

  const nextValues = {
    ...currentProduct.toObject(),
    name: payload.name ? String(payload.name).trim() : currentProduct.name,
    title: payload.title ? String(payload.title).trim() : payload.name ? String(payload.name).trim() : currentProduct.title,
    brand: payload.brand !== undefined ? String(payload.brand).trim() : currentProduct.brand,
    category: payload.category ? String(payload.category).trim() : currentProduct.category,
    price: payload.price !== undefined ? Number(payload.price) : currentProduct.price,
    oldPrice: payload.oldPrice !== undefined ? (payload.oldPrice === null ? null : Number(payload.oldPrice)) : currentProduct.oldPrice,
    stock: payload.stock !== undefined ? Number(payload.stock) : currentProduct.stock,
    image: payload.image !== undefined ? String(payload.image).trim() : currentProduct.image,
    desc: payload.desc !== undefined ? String(payload.desc).trim() : currentProduct.desc,
    description: payload.description !== undefined ? String(payload.description).trim() : currentProduct.description,
    badge: payload.badge !== undefined ? String(payload.badge).trim() : currentProduct.badge,
    tags: Array.isArray(payload.tags) ? payload.tags.map(String) : currentProduct.tags,
    rating: payload.rating !== undefined ? Number(payload.rating) : currentProduct.rating,
    isRecommended: payload.isRecommended !== undefined ? Boolean(payload.isRecommended) : Boolean(currentProduct.isRecommended),
    recommendedOrder: payload.recommendedOrder !== undefined ? Number(payload.recommendedOrder ?? 0) : Number(currentProduct.recommendedOrder ?? 0),
  };

  if (Array.isArray(payload.images) && payload.images.length > 0) {
    nextValues.images = payload.images.filter(Boolean).map(String);
    if (!nextValues.image) nextValues.image = nextValues.images[0];
  }

  const product = await Product.findByIdAndUpdate(id, nextValues, { new: true, runValidators: true });
  return normalizeProduct(product);
};

export const deleteProductRecord = async (id) => {
  const product = await Product.findByIdAndDelete(id);

  if (!product) {
    const error = new Error('Producto no encontrado');
    error.statusCode = 404;
    throw error;
  }

  return { id };
};

export const getTopSellerProductRecord = async () => {
  // 1. Analizar órdenes completadas
  const Order = (await import('../models/Order.js')).default;
  const SiteConfig = (await import('../models/SiteConfig.js')).default;

  const topSellers = await Order.aggregate([
    { $match: { status: 'Completada' } },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.productId',
        totalSold: { $sum: '$items.quantity' },
      },
    },
    { $sort: { totalSold: -1 } },
    { $limit: 1 },
  ]);

  if (topSellers.length > 0 && topSellers[0]._id) {
    const product = await Product.findById(topSellers[0]._id).lean();
    if (product) {
      return {
        ...normalizeProduct(product),
        totalSold: topSellers[0].totalSold,
      };
    }
  }

  // Fallback 1: Buscar en heroConfig.featuredProductId
  const config = await SiteConfig.findOne().lean();
  if (config?.heroConfig?.featuredProductId) {
    const featured = await Product.findById(config.heroConfig.featuredProductId).lean();
    if (featured) {
      return {
        ...normalizeProduct(featured),
        totalSold: 0,
        isFallback: true,
      };
    }
  }

  // Fallback 2: Primer producto activo en el catálogo
  const firstProduct = await Product.findOne().sort({ createdAt: -1 }).lean();
  if (firstProduct) {
    return {
      ...normalizeProduct(firstProduct),
      totalSold: 0,
      isFallback: true,
    };
  }

  return null;
};
