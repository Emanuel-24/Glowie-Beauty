import Tag from '../models/Tag.js';
import Product from '../models/Product.js';

export const normalizeTag = (tag = {}, productCount = 0) => ({
  id: tag.id ?? tag._id?.toString?.() ?? null,
  _id: tag._id?.toString?.() ?? tag.id ?? null,
  name: tag.name ?? '',
  slug: tag.slug ?? '',
  description: tag.description ?? '',
  products: Number(productCount ?? 0),
});

export const getAllTags = async () => {
  const tags = await Tag.find({}).sort({ name: 1 }).lean();
  
  // Contar productos que tengan cada tag
  const counts = await Product.aggregate([
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
  ]);

  const productCountMap = Object.fromEntries(
    counts.map((entry) => [String(entry._id).toLowerCase(), Number(entry.count || 0)])
  );

  return tags.map((tag) =>
    normalizeTag(tag, productCountMap[String(tag.name).toLowerCase()] ?? 0)
  );
};

export const createTagRecord = async ({ name, description }) => {
  const trimmedName = String(name || '').trim();
  const trimmedDesc = String(description || '').trim();

  if (!trimmedName) {
    const error = new Error('El nombre de la etiqueta es obligatorio');
    error.statusCode = 400;
    throw error;
  }

  const exists = await Tag.findOne({ name: { $regex: `^${trimmedName}$`, $options: 'i' } }).lean();
  if (exists) {
    const error = new Error('La etiqueta ya existe');
    error.statusCode = 409;
    throw error;
  }

  const tag = await Tag.create({
    name: trimmedName,
    description: trimmedDesc,
  });

  return normalizeTag(tag, 0);
};

export const deleteTagRecord = async (id) => {
  const tag = await Tag.findByIdAndDelete(id);

  if (!tag) {
    const error = new Error('Etiqueta no encontrada');
    error.statusCode = 404;
    throw error;
  }

  return { id };
};
