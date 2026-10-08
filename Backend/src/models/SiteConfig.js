import mongoose from 'mongoose';

const communityItemSchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      default: '',
      trim: true,
    },
    link: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { _id: true }
);

const heroConfigSchema = new mongoose.Schema(
  {
    featuredProductId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      default: null,
    },
    floatingBadgeText: {
      type: String,
      default: '✨ ¡Nuevo producto!',
      trim: true,
    },
    tagline: {
      type: String,
      default: 'RUTINA COMPLETA',
      trim: true,
    },
    title: {
      type: String,
      default: 'Glow Natural Everyday',
      trim: true,
    },
  },
  { _id: false }
);

const siteConfigSchema = new mongoose.Schema(
  {
    heroConfig: {
      type: heroConfigSchema,
      default: () => ({}),
    },
    communityConfig: {
      type: [communityItemSchema],
      default: [
        {
          imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
          title: '@sofia_glowe',
          link: 'https://instagram.com/GloweBeautyCO',
        },
        {
          imageUrl: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=600&q=80',
          title: '@camila_beauty',
          link: 'https://instagram.com/GloweBeautyCO',
        },
        {
          imageUrl: 'https://placehold.co/400x400/FDE2E4/FF758F?text=Glowe',
          title: '@valentina_hair',
          link: 'https://instagram.com/GloweBeautyCO',
        },
        {
          imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80',
          title: '@mariana_style',
          link: 'https://instagram.com/GloweBeautyCO',
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

const SiteConfig = mongoose.model('SiteConfig', siteConfigSchema);

export default SiteConfig;
