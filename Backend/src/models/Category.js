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

categorySchema.pre('validate', function normalizeCategory() {
  if (this.name) {
    this.name = this.name.trim();
  }

  if (!this.name) {
    throw new Error('La categoría debe tener un nombre válido.');
  }

  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  if (this.description === undefined || this.description === null) {
    this.description = '';
  }
});

const Category = mongoose.model('Category', categorySchema);

export default Category;
