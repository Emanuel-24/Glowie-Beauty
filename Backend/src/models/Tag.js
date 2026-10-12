import mongoose from 'mongoose';

const tagSchema = new mongoose.Schema(
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
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

tagSchema.pre('validate', function normalizeTag() {
  if (this.name) {
    this.name = this.name.trim();
  }

  if (!this.name) {
    throw new Error('La etiqueta debe tener un nombre válido.');
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

const Tag = mongoose.model('Tag', tagSchema);

export default Tag;
