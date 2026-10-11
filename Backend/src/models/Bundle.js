import mongoose from 'mongoose';

const bundleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    desc: {
      type: String,
      trim: true,
      default: '',
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    oldPrice: {
      type: Number,
      min: 0,
      default: null,
    },
    image: {
      type: String,
      default: '',
    },
    badge: {
      type: String,
      trim: true,
      default: 'COMBO',
    },
    badgeBg: {
      type: String,
      default: 'bg-glowe-pink',
    },
    badgeText: {
      type: String,
      default: 'text-glowe-pink-accent',
    },
    border: {
      type: String,
      default: 'border-glowe-pink/60',
    },
    btn: {
      type: String,
      default: 'bg-glowe-pink-accent hover:bg-rose-500',
    },
    productIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Bundle = mongoose.model('Bundle', bundleSchema);

export default Bundle;
