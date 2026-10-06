import Order from '../models/Order.js';

export const normalizeOrder = (order) => ({
  id: order._id?.toString?.() ?? order.id,
  invoice: order.invoice || `FAC-${String(order._id || 'GLOWE').slice(-6).toUpperCase()}`,
  customer: order.customer || 'Cliente Glowe',
  userId: order.userId?._id?.toString?.() ?? order.userId,
  items: Array.isArray(order.items) ? order.items : [],
  total: Number(order.total || 0),
  amountPaid: Number(order.amountPaid || 0),
  balance: Number(order.balance ?? Math.max(0, Number(order.total || 0) - Number(order.amountPaid || 0))),
  paymentStatus: order.paymentStatus || 'Sin pagos',
  shippingAddress: order.shippingAddress || 'Sin dirección asociada',
  status: order.status || 'Pendiente',
  createdAt: order.createdAt,
  updatedAt: order.updatedAt,
});

export const getAllOrders = async () => {
  const orders = await Order.find({}).populate('userId', 'name email').sort({ createdAt: -1 }).lean();
  return orders.map(normalizeOrder);
};

export const getOrderByIdRecord = async (id) => {
  const order = await Order.findById(id).populate('userId', 'name email').lean();
  if (!order) {
    const error = new Error('Pedido no encontrado');
    error.statusCode = 404;
    throw error;
  }
  return normalizeOrder(order);
};

export const createOrderRecord = async ({ items, total, shippingAddress, customer, invoice, status, userId, userName }) => {
  if (!userId) {
    const error = new Error('Debes iniciar sesión para crear una orden');
    error.statusCode = 401;
    throw error;
  }

  if (!Array.isArray(items) || total === undefined || (!shippingAddress && !customer)) {
    const error = new Error('Faltan datos para crear la orden');
    error.statusCode = 400;
    throw error;
  }

  const calculatedTotal = Number(total);
  const order = await Order.create({
    userId,
    invoice: invoice || `FAC-${Date.now()}`,
    customer: customer || userName || 'Cliente Glowe',
    items,
    total: calculatedTotal,
    amountPaid: 0,
    balance: calculatedTotal,
    paymentStatus: 'Sin pagos',
    shippingAddress: shippingAddress || customer || 'Sin dirección asociada',
    status: status || 'Pendiente',
  });

  return normalizeOrder(order);
};

export const updateOrderRecord = async (id, { status, total, customer, invoice, shippingAddress }) => {
  const order = await Order.findById(id);

  if (!order) {
    const error = new Error('Pedido no encontrado');
    error.statusCode = 404;
    throw error;
  }

  if (status) order.status = status;
  if (total !== undefined) order.total = Number(total);
  if (customer) order.customer = customer;
  if (invoice) order.invoice = invoice;
  if (shippingAddress) order.shippingAddress = shippingAddress;

  await order.save();
  return normalizeOrder(order);
};

export const deleteOrderRecord = async (id) => {
  const order = await Order.findByIdAndDelete(id);

  if (!order) {
    const error = new Error('Pedido no encontrado');
    error.statusCode = 404;
    throw error;
  }

  return { id };
};
