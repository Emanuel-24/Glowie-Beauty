import mongoose from 'mongoose';
import Bundle from '../models/Bundle.js';

export const normalizeBundle = (bundle = {}) => {
  if (!bundle || typeof bundle !== 'object') return bundle;

  const raw = typeof bundle.toObject === 'function' ? bundle.toObject() : bundle;
  const id = raw._id?.toString?.() ?? raw.id ?? null;

  return {
    ...raw,
    id,
    _id: raw._id?.toString?.() ?? id,
    name: raw.name || 'Combo Glowe',
    desc: raw.desc || '',
    price: Number(raw.price ?? 0),
    oldPrice: raw.oldPrice != null ? Number(raw.oldPrice) : null,
    image: raw.image || '',
    badge: raw.badge || 'COMBO',
    badgeBg: raw.badgeBg || 'bg-glowe-pink',
    badgeText: raw.badgeText || 'text-glowe-pink-accent',
    border: raw.border || 'border-glowe-pink/60',
    btn: raw.btn || 'bg-glowe-pink-accent hover:bg-rose-500',
    productIds: Array.isArray(raw.productIds)
      ? raw.productIds.map((p) => {
          if (!p) return null;
          if (typeof p === 'object' && p._id) {
            return {
              ...p,
              id: p._id.toString(),
              _id: p._id.toString(),
            };
          }
          return p.toString?.() ?? p;
        }).filter(Boolean)
      : [],
    isActive: Boolean(raw.isActive !== false),
  };
};

export const getAllBundles = async (filter = {}) => {
  const bundles = await Bundle.find(filter).populate('productIds').sort({ createdAt: -1 }).lean();
  return bundles.map(normalizeBundle);
};

export const getBundleByIdRecord = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Identificador de combo no válido');
    error.statusCode = 400;
    throw error;
  }

  const bundle = await Bundle.findById(id).populate('productIds').lean();
  if (!bundle) {
    const error = new Error('Combo no encontrado');
    error.statusCode = 404;
    throw error;
  }

  return normalizeBundle(bundle);
};

export const createBundleRecord = async (payload = {}) => {
  const validProductIds = Array.isArray(payload.productIds)
    ? payload.productIds.filter((id) => mongoose.Types.ObjectId.isValid(id))
    : [];

  const newBundle = await Bundle.create({
    name: String(payload.name || '').trim() || 'Nuevo Combo',
    desc: String(payload.desc || '').trim(),
    price: Number(payload.price ?? 0),
    oldPrice: payload.oldPrice != null && payload.oldPrice !== '' ? Number(payload.oldPrice) : null,
    image: String(payload.image || '').trim(),
    badge: String(payload.badge || 'COMBO').trim(),
    badgeBg: String(payload.badgeBg || 'bg-glowe-pink').trim(),
    badgeText: String(payload.badgeText || 'text-glowe-pink-accent').trim(),
    border: String(payload.border || 'border-glowe-pink/60').trim(),
    btn: String(payload.btn || 'bg-glowe-pink-accent hover:bg-rose-500').trim(),
    productIds: validProductIds,
    isActive: payload.isActive !== undefined ? Boolean(payload.isActive) : true,
  });

  const populated = await Bundle.findById(newBundle._id).populate('productIds').lean();
  return normalizeBundle(populated);
};

export const updateBundleRecord = async (id, payload = {}) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Identificador de combo no válido');
    error.statusCode = 400;
    throw error;
  }

  const bundle = await Bundle.findById(id);
  if (!bundle) {
    const error = new Error('Combo no encontrado');
    error.statusCode = 404;
    throw error;
  }

  if (payload.name !== undefined) bundle.name = String(payload.name).trim();
  if (payload.desc !== undefined) bundle.desc = String(payload.desc).trim();
  if (payload.price !== undefined) bundle.price = Number(payload.price);
  if (payload.oldPrice !== undefined) {
    bundle.oldPrice = payload.oldPrice != null && payload.oldPrice !== '' ? Number(payload.oldPrice) : null;
  }
  if (payload.image !== undefined) bundle.image = String(payload.image).trim();
  if (payload.badge !== undefined) bundle.badge = String(payload.badge).trim();
  if (payload.badgeBg !== undefined) bundle.badgeBg = String(payload.badgeBg).trim();
  if (payload.badgeText !== undefined) bundle.badgeText = String(payload.badgeText).trim();
  if (payload.border !== undefined) bundle.border = String(payload.border).trim();
  if (payload.btn !== undefined) bundle.btn = String(payload.btn).trim();
  if (payload.isActive !== undefined) bundle.isActive = Boolean(payload.isActive);

  if (Array.isArray(payload.productIds)) {
    bundle.productIds = payload.productIds.filter((pId) => mongoose.Types.ObjectId.isValid(pId));
  }

  await bundle.save();
  const populated = await Bundle.findById(bundle._id).populate('productIds').lean();
  return normalizeBundle(populated);
};

export const deleteBundleRecord = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Identificador de combo no válido');
    error.statusCode = 400;
    throw error;
  }

  const bundle = await Bundle.findByIdAndDelete(id);
  if (!bundle) {
    const error = new Error('Combo no encontrado');
    error.statusCode = 404;
    throw error;
  }

  return { id };
};
