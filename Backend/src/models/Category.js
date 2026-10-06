import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
    },
    description: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Activa', 'Pausada'],
      default: 'Activa',
    },
  },
  {
    timestamps: true,
  }
);

categorySchema.pre('validate', function normalizeCategory(next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  if (!this.name) {
    return next(new Error('La categoría debe tener un nombre válido.'));
  }

  next();
});

const Category = mongoose.model('Category', categorySchema);

export default Category;
