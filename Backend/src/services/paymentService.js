import Order from '../models/Order.js';
import Payment from '../models/Payment.js';

export const normalizePayment = (payment) => ({
  id: payment._id?.toString?.() ?? payment.id,
  orderId: payment.orderId?._id?.toString?.() ?? payment.orderId,
  userId: payment.userId?._id?.toString?.() ?? payment.userId,
  amount: Number(payment.amount || 0),
  method: payment.method || 'Efectivo',
  reference: payment.reference || '',
  status: payment.status || 'Confirmado',
  note: payment.note || '',
  registeredBy: payment.registeredBy?._id?.toString?.() ?? payment.registeredBy,
  createdAt: payment.createdAt,
});

export const syncOrderPaymentStatus = async (orderId) => {
  const order = await Order.findById(orderId);
  if (!order) return null;

  const payments = await Payment.find({ orderId, status: 'Confirmado' }).lean();
  const amountPaid = payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const total = Number(order.total || 0);
  const balance = Math.max(0, total - amountPaid);

  order.amountPaid = amountPaid;
  order.balance = balance;
  order.paymentStatus = amountPaid <= 0 ? 'Sin pagos' : balance > 0 ? 'Abonada' : 'Pagada';

  await order.save();
  return order;
};

export const getAllPayments = async () => {
  const payments = await Payment.find({})
    .populate('orderId', 'invoice customer total')
    .populate('userId', 'name email')
    .populate('registeredBy', 'name email')
    .sort({ createdAt: -1 })
    .lean();

  return payments.map(normalizePayment);
};

export const getOrderPaymentsRecord = async (orderId) => {
  const order = await Order.findById(orderId).lean();
  if (!order) {
    const error = new Error('Orden no encontrada');
    error.statusCode = 404;
    throw error;
  }

  const payments = await Payment.find({ orderId })
    .populate('registeredBy', 'name email')
    .sort({ createdAt: -1 })
    .lean();

  return {
    order: {
      id: order._id?.toString?.() ?? order.id,
      total: Number(order.total || 0),
      amountPaid: Number(order.amountPaid || 0),
      balance: Number(order.balance ?? order.total - (order.amountPaid || 0)),
      paymentStatus: order.paymentStatus || 'Sin pagos',
    },
    payments: payments.map(normalizePayment),
  };
};

export const createPaymentRecord = async ({
  orderId,
  amount,
  method,
  reference = '',
  note = '',
  idempotencyKey,
  registeredByUserId,
}) => {
  if (!orderId || amount === undefined || !method) {
    const error = new Error('Faltan datos para registrar el pago');
    error.statusCode = 400;
    throw error;
  }

  const parsedAmount = Number(amount);
  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    const error = new Error('El valor del abono debe ser mayor a cero');
    error.statusCode = 400;
    throw error;
  }

  const order = await Order.findById(orderId);
  if (!order) {
    const error = new Error('Orden no encontrada');
    error.statusCode = 404;
    throw error;
  }

  const balance = Number(order.balance ?? Math.max(0, Number(order.total || 0) - Number(order.amountPaid || 0)));
  if (parsedAmount > balance) {
    const error = new Error('El abono excede el saldo pendiente de la orden');
    error.statusCode = 400;
    throw error;
  }

  if (idempotencyKey) {
    const existingPayment = await Payment.findOne({ idempotencyKey }).lean();
    if (existingPayment) {
      return {
        payment: normalizePayment(existingPayment),
        order: null,
        alreadyProcessed: true,
      };
    }
  }

  const payment = await Payment.create({
    orderId,
    userId: order.userId,
    amount: parsedAmount,
    method,
    reference: String(reference || '').trim(),
    note: String(note || '').trim(),
    registeredBy: registeredByUserId,
    idempotencyKey: idempotencyKey ? String(idempotencyKey).trim() : undefined,
    status: 'Confirmado',
  });

  const syncedOrder = await syncOrderPaymentStatus(orderId);

  return {
    payment: normalizePayment(payment),
    order: syncedOrder
      ? {
          id: syncedOrder._id.toString(),
          total: Number(syncedOrder.total || 0),
          amountPaid: Number(syncedOrder.amountPaid || 0),
          balance: Number(syncedOrder.balance || 0),
          paymentStatus: syncedOrder.paymentStatus || 'Sin pagos',
        }
      : null,
    alreadyProcessed: false,
  };
};

export const cancelPaymentRecord = async (id) => {
  const payment = await Payment.findById(id);
  if (!payment) {
    const error = new Error('Pago no encontrado');
    error.statusCode = 404;
    throw error;
  }

  if (payment.status === 'Anulado') {
    const error = new Error('El pago ya está anulado');
    error.statusCode = 400;
    throw error;
  }

  payment.status = 'Anulado';
  await payment.save();

  const syncedOrder = await syncOrderPaymentStatus(payment.orderId);

  return {
    payment: normalizePayment(payment),
    order: syncedOrder
      ? {
          id: syncedOrder._id.toString(),
          total: Number(syncedOrder.total || 0),
          amountPaid: Number(syncedOrder.amountPaid || 0),
          balance: Number(syncedOrder.balance || 0),
          paymentStatus: syncedOrder.paymentStatus || 'Sin pagos',
        }
      : null,
  };
};
