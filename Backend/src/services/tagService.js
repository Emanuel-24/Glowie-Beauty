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

  // Contar productos que tengan cada tag con agregación protegida
  const counts = await Product.aggregate([
    { $match: { tags: { $exists: true, $type: 'array', $ne: [] } } },
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
  const trimmedDesc = description !== undefined && description !== null ? String(description).trim() : '';

  if (!trimmedName) {
    const error = new Error('El nombre de la etiqueta es obligatorio');
    error.statusCode = 400;
    throw error;
  }

  const escapedName = trimmedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const exists = await Tag.findOne({ name: { $regex: `^${escapedName}$`, $options: 'i' } }).lean();
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

export const updateTagRecord = async (id, { name, description }) => {
  const tag = await Tag.findById(id);

  if (!tag) {
    const error = new Error('Etiqueta no encontrada');
    error.statusCode = 404;
    throw error;
  }

  if (name) {
    const nextName = String(name).trim();
    if (nextName.toLowerCase() !== tag.name.toLowerCase()) {
      const escapedName = nextName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const exists = await Tag.findOne({
        _id: { $ne: id },
        name: { $regex: `^${escapedName}$`, $options: 'i' },
      }).lean();
      if (exists) {
        const error = new Error('Ya existe otra etiqueta con ese nombre');
        error.statusCode = 409;
        throw error;
      }
    }
    tag.name = nextName;
    tag.slug = ''; // triggers slug regeneration in pre-validate
  }

  if (description !== undefined) {
    tag.description = description ? String(description).trim() : '';
  }

  await tag.save();

  return normalizeTag(tag, 0);
};

export const deleteTagRecord = async (id) => {
  const tag = await Tag.findById(id);

  if (!tag) {
    const error = new Error('Etiqueta no encontrada');
    error.statusCode = 404;
    throw error;
  }

  // Validar si existen productos asociados que tengan esta etiqueta
  const escapedName = tag.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const linkedProductsCount = await Product.countDocuments({
    tags: { $regex: `^${escapedName}$`, $options: 'i' },
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

  await Tag.findByIdAndDelete(id);

  return { id };
};
