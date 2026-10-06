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
  const productCountMap = Object.fromEntries(
    counts.map((entry) => [String(entry._id), Number(entry.count || 0)])
  );

  return categories.map((category) =>
    normalizeCategory(category, productCountMap[String(category.name)] ?? 0)
  );
};

export const createCategoryRecord = async ({ name, description, status }) => {
  const trimmedName = String(name || '').trim();
  const trimmedDesc = String(description || '').trim();
  const trimmedStatus = String(status || 'Activa').trim();

  if (!trimmedName) {
    const error = new Error('El nombre de la categoría es obligatorio');
    error.statusCode = 400;
    throw error;
  }

  const exists = await Category.findOne({ name: { $regex: `^${trimmedName}$`, $options: 'i' } }).lean();
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
  const category = await Category.findByIdAndUpdate(
    id,
    {
      name: payload.name ? String(payload.name).trim() : undefined,
      description: payload.description !== undefined ? String(payload.description).trim() : undefined,
      status: payload.status ? String(payload.status).trim() : undefined,
    },
    { new: true, runValidators: true }
  );

  if (!category) {
    const error = new Error('Categoría no encontrada');
    error.statusCode = 404;
    throw error;
  }

  return normalizeCategory(category, 0);
};

export const deleteCategoryRecord = async (id) => {
  const category = await Category.findByIdAndDelete(id);

  if (!category) {
    const error = new Error('Categoría no encontrada');
    error.statusCode = 404;
    throw error;
  }

  return { id };
};
