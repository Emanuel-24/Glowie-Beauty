import Category from '../models/Category.js';
import Product from '../models/Product.js';

export const normalizeCategory = (category = {}, productCount = 0) => ({
  id: category.id ?? category._id?.toString?.() ?? null,
  _id: category._id?.toString?.() ?? category.id ?? null,
  name: category.name ?? 'Categoría',
  slug: category.slug ?? '',
  description: category.description ?? '',
  status: category.status ?? 'Activa',
  products: Number(productCount ?? 0),
  revenue: '$0',
});

export const getAllCategories = async () => {
  const categories = await Category.find({}).lean();
  const counts = await Product.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]);
  const productCountMap = {};
  counts.forEach((entry) => {
    const key = String(entry._id || '').toLowerCase().trim();
    if (key) {
      productCountMap[key] = Number(entry.count || 0);
    }
  });

  return categories.map((category) => {
    const byName = productCountMap[String(category.name || '').toLowerCase().trim()];
    const bySlug = productCountMap[String(category.slug || '').toLowerCase().trim()];
    const byId = productCountMap[String(category._id || '').toLowerCase().trim()];
    const count = byName ?? bySlug ?? byId ?? 0;
    return normalizeCategory(category, count);
  });
};

export const createCategoryRecord = async ({ name, description, status }) => {
  const trimmedName = String(name || '').trim();
  const trimmedDesc = description !== undefined && description !== null ? String(description).trim() : '';
  const trimmedStatus = String(status || 'Activa').trim();

  if (!trimmedName) {
    const error = new Error('El nombre de la categoría es obligatorio');
    error.statusCode = 400;
    throw error;
  }

  const escapedName = trimmedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const exists = await Category.findOne({ name: { $regex: `^${escapedName}$`, $options: 'i' } }).lean();
  if (exists) {
    const error = new Error('La categoría ya existe');
    error.statusCode = 409;
    throw error;
  }

  const category = await Category.create({
    name: trimmedName,
    description: trimmedDesc,
    status: ['Activa', 'Pausada'].includes(trimmedStatus) ? trimmedStatus : 'Activa',
  });

  return normalizeCategory(category, 0);
};

export const updateCategoryRecord = async (id, payload = {}) => {
  const category = await Category.findById(id);

  if (!category) {
    const error = new Error('Categoría no encontrada');
    error.statusCode = 404;
    throw error;
  }

  if (payload.name) {
    const nextName = String(payload.name).trim();
    if (nextName.toLowerCase() !== category.name.toLowerCase()) {
      const escapedName = nextName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const exists = await Category.findOne({
        _id: { $ne: id },
        name: { $regex: `^${escapedName}$`, $options: 'i' },
      }).lean();
      if (exists) {
        const error = new Error('Ya existe otra categoría con ese nombre');
        error.statusCode = 409;
        throw error;
      }
    }
    category.name = nextName;
    category.slug = ''; // triggers slug regeneration in pre-validate
  }

  if (payload.description !== undefined) {
    category.description = payload.description ? String(payload.description).trim() : '';
  }

  if (payload.status) {
    const nextStatus = String(payload.status).trim();
    category.status = ['Activa', 'Pausada'].includes(nextStatus) ? nextStatus : 'Activa';
  }

  await category.save();

  return normalizeCategory(category, 0);
};

export const deleteCategoryRecord = async (id) => {
  const category = await Category.findById(id);

  if (!category) {
    const error = new Error('Categoría no encontrada');
    error.statusCode = 404;
    throw error;
  }

  // Validar si existen productos asociados (por nombre o slug)
  const escapedName = category.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const linkedProductsCount = await Product.countDocuments({
    $or: [
      { category: { $regex: `^${escapedName}$`, $options: 'i' } },
      { category: category.slug },
    ],
  });

  if (linkedProductsCount > 0) {
    const error = new Error(
      `No se puede eliminar porque tiene ${linkedProductsCount} ${
        linkedProductsCount === 1 ? 'producto asociado' : 'productos asociados'
      }`
    );
    error.statusCode = 400;
    throw error;
  }

  await Category.findByIdAndDelete(id);

  return { id };
};
