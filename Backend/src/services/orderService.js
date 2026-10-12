import mongoose from 'mongoose';
import Order from '../models/Order.js';

export const normalizeOrder = (order) => {
  const items = Array.isArray(order.items)
    ? order.items.map((it) => {
        const title = it.title || it.name || 'Producto Glowe';
        const qty = Number(it.quantity ?? it.qty ?? 1);
        const price = Number(it.price ?? 0);
        const rawId = it.productId?.toString?.() ?? it.productId ?? it.id;
        return {
          productId: rawId,
          id: rawId,
          title,
          name: title,
          quantity: qty,
          qty,
          price,
          image: it.image || '',
        };
      })
    : [];

  const customerName = typeof order.customer === 'string'
    ? order.customer
    : order.customer?.fullName || order.customer?.name || 'Cliente Glowe';

  const customerEmail = order.customerEmail || (typeof order.customer === 'object' ? order.customer?.email : '') || '';
  const customerPhone = order.customerPhone || (typeof order.customer === 'object' ? order.customer?.phone : '') || '';
  const customerCedula = order.customerCedula || (typeof order.customer === 'object' ? order.customer?.cedula : '') || '';
  const customerCity = order.customerCity || (typeof order.customer === 'object' ? order.customer?.city : '') || '';
  const customerDepartment = order.customerDepartment || (typeof order.customer === 'object' ? order.customer?.department : '') || '';

  const shippingAddress = typeof order.shippingAddress === 'string' && order.shippingAddress.trim()
    ? order.shippingAddress.trim()
    : (typeof order.customer === 'object' && order.customer?.address ? order.customer.address : 'Sin dirección asociada');

  const total = Number(order.total || 0);
  const amountPaid = Number(order.amountPaid || 0);
  const balance = Number(order.balance ?? Math.max(0, total - amountPaid));

  return {
    id: order._id?.toString?.() ?? order.id,
    invoice: order.invoice || `FAC-${String(order._id || 'GLOWE').slice(-6).toUpperCase()}`,
    customer: customerName,
    customerEmail,
    customerPhone,
    customerCedula,
    customerCity,
    customerDepartment,
    userId: order.userId?._id?.toString?.() ?? (order.userId ? String(order.userId) : null),
    items,
    subtotal: Number(order.subtotal ?? total),
    shippingCost: Number(order.shippingCost ?? 0),
    total,
    amountPaid,
    balance,
    paymentMethod: order.paymentMethod || 'contra_entrega',
    paymentStatus: order.paymentStatus || 'Sin pagos',
    shippingAddress,
    status: order.status || 'Pendiente',
    notes: order.notes || '',
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
};

export const getAllOrders = async () => {
  const orders = await Order.find({}).populate('userId', 'name email').sort({ createdAt: -1 }).lean();
  return orders.map(normalizeOrder);
};

export const getOrdersByUser = async ({ userId, email } = {}) => {
  const queryConditions = [];
  if (userId && mongoose.Types.ObjectId.isValid(userId)) {
    queryConditions.push({ userId });
  }
  if (email && typeof email === 'string' && email.trim()) {
    queryConditions.push({ customerEmail: new RegExp(`^${email.trim()}$`, 'i') });
  }

  if (queryConditions.length === 0) return [];

  const orders = await Order.find({ $or: queryConditions })
    .populate('userId', 'name email')
    .sort({ createdAt: -1 })
    .lean();
  return orders.map(normalizeOrder);
};

export const getOrderByIdRecord = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Identificador de pedido no válido');
    error.statusCode = 400;
    throw error;
  }

  const order = await Order.findById(id).populate('userId', 'name email').lean();
  if (!order) {
    const error = new Error('Pedido no encontrado');
    error.statusCode = 404;
    throw error;
  }
  return normalizeOrder(order);
};

export const createOrderRecord = async (payload = {}) => {
  const {
    items = [],
    total,
    subtotal,
    shippingCost,
    shippingAddress,
    customer,
    customerEmail,
    customerPhone,
    customerCedula,
    customerCity,
    customerDepartment,
    paymentMethod,
    invoice,
    status,
    notes,
    userId,
    userName,
    orderId,
  } = payload;

  if (!Array.isArray(items) || items.length === 0 || total === undefined) {
    const error = new Error('Faltan productos o el monto total para crear la orden');
    error.statusCode = 400;
    throw error;
  }

  const normalizedItems = items.map((it) => {
    const itemTitle = String(it.title || it.name || 'Producto Glowe').trim();
    const itemPrice = Number(it.price || 0);
    const itemQty = Number(it.quantity ?? it.qty ?? 1);
    const rawProductId = it.productId || it.id;
    const productId = mongoose.Types.ObjectId.isValid(rawProductId) ? rawProductId : undefined;
    return {
      productId,
      title: itemTitle,
      quantity: Math.max(1, itemQty),
      price: Math.max(0, itemPrice),
      image: it.image || '',
    };
  });

  const customerName = typeof customer === 'string'
    ? customer.trim()
    : (customer?.fullName || customer?.name || userName || 'Cliente Glowe').trim();

  const email = customerEmail || (typeof customer === 'object' ? customer?.email : '') || '';
  const phone = customerPhone || (typeof customer === 'object' ? customer?.phone : '') || '';
  const cedula = customerCedula || (typeof customer === 'object' ? customer?.cedula : '') || '';
  const city = customerCity || (typeof customer === 'object' ? customer?.city : '') || '';
  const department = customerDepartment || (typeof customer === 'object' ? customer?.department : '') || '';

  const address = shippingAddress
    ? (typeof shippingAddress === 'string' ? shippingAddress.trim() : shippingAddress?.address || '')
    : (typeof customer === 'object' ? customer?.address || '' : '');

  const finalAddress = address || (city ? `${city}, Colombia` : 'Dirección por coordinar');
  const calculatedTotal = Number(total);
  const invoiceNumber = invoice || orderId || `FAC-${Date.now().toString().slice(-6)}`;
  const finalUserId = userId && mongoose.Types.ObjectId.isValid(userId) ? userId : undefined;

  const order = await Order.create({
    userId: finalUserId,
    invoice: invoiceNumber,
    customer: customerName || 'Cliente Glowe',
    customerEmail: email,
    customerPhone: phone,
    customerCedula: cedula,
    customerCity: city,
    customerDepartment: department,
    items: normalizedItems,
    subtotal: Number(subtotal ?? calculatedTotal),
    shippingCost: Number(shippingCost ?? 0),
    total: calculatedTotal,
    paymentMethod: paymentMethod || 'contra_entrega',
    amountPaid: 0,
    balance: calculatedTotal,
    paymentStatus: 'Sin pagos',
    shippingAddress: finalAddress,
    status: status || 'Pendiente',
    notes: notes || '',
  });

  return normalizeOrder(order);
};

export const updateOrderRecord = async (id, updates = {}) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Identificador de pedido no válido');
    error.statusCode = 400;
    throw error;
  }

  const order = await Order.findById(id);
  if (!order) {
    const error = new Error('Pedido no encontrado');
    error.statusCode = 404;
    throw error;
  }

  if (Array.isArray(updates.items)) {
    order.items = updates.items.map((it) => {
      const itemTitle = String(it.title || it.name || 'Producto Glowe').trim();
      const itemPrice = Number(it.price || 0);
      const itemQty = Number(it.quantity ?? it.qty ?? 1);
      const rawProductId = it.productId || it.id;
      const productId = mongoose.Types.ObjectId.isValid(rawProductId) ? rawProductId : undefined;
      return {
        productId,
        title: itemTitle,
        quantity: Math.max(1, itemQty),
        price: Math.max(0, itemPrice),
        image: it.image || '',
      };
    });
  }
  if (updates.subtotal !== undefined) order.subtotal = Number(updates.subtotal);
  if (updates.shippingCost !== undefined) order.shippingCost = Number(updates.shippingCost);
  if (updates.total !== undefined) order.total = Number(updates.total);
  if (updates.customer) order.customer = updates.customer;
  if (updates.customerPhone !== undefined) order.customerPhone = updates.customerPhone;
  if (updates.customerEmail !== undefined) order.customerEmail = updates.customerEmail;
  if (updates.customerCity !== undefined) order.customerCity = updates.customerCity;
  if (updates.customerDepartment !== undefined) order.customerDepartment = updates.customerDepartment;
  if (updates.invoice) order.invoice = updates.invoice;
  if (updates.shippingAddress) order.shippingAddress = updates.shippingAddress;
  if (updates.notes !== undefined) order.notes = updates.notes;
  if (updates.paymentMethod !== undefined) order.paymentMethod = updates.paymentMethod;
  if (updates.paymentStatus) order.paymentStatus = updates.paymentStatus;
  if (updates.status) order.status = updates.status;

  if (updates.amountPaid !== undefined) {
    order.amountPaid = Number(updates.amountPaid);
    order.balance = Math.max(0, order.total - order.amountPaid);
  }
  if (updates.balance !== undefined) {
    order.balance = Number(updates.balance);
  }

  if (updates.liquidateBalance || (updates.status === 'Completada' && (updates.balance === 0 || updates.liquidateBalance))) {
    order.amountPaid = order.total;
    order.balance = 0;
    order.paymentStatus = 'Pagada';
  }

  await order.save();
  return normalizeOrder(order);
};

export const deleteOrderRecord = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Identificador de pedido no válido');
    error.statusCode = 400;
    throw error;
  }

  const order = await Order.findByIdAndDelete(id);
  if (!order) {
    const error = new Error('Pedido no encontrado');
    error.statusCode = 404;
    throw error;
  }

  return { id };
};
