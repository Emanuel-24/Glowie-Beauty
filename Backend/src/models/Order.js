import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    title: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    invoice: {
      type: String,
      trim: true,
      default: 'FAC-GLOWE',
    },
    customer: {
      type: String,
      trim: true,
      default: 'Cliente Glowe',
    },
    items: {
      type: [orderItemSchema],
      required: true,
      default: [],
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    amountPaid: {
      type: Number,
      default: 0,
      min: 0,
    },
    balance: {
      type: Number,
      default: 0,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['Sin pagos', 'Abonada', 'Pagada'],
      default: 'Sin pagos',
    },
    shippingAddress: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Pendiente', 'Completada', 'Anulada'],
      default: 'Pendiente',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model('Order', orderSchema);

export default Order;
