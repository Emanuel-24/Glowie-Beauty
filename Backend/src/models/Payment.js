import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    method: {
      type: String,
      enum: ['Efectivo', 'Transferencia', 'Tarjeta', 'Otro'],
      required: true,
    },
    reference: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['Confirmado', 'Anulado'],
      default: 'Confirmado',
    },
    note: {
      type: String,
      trim: true,
      default: '',
    },
    registeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    idempotencyKey: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
