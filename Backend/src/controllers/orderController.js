import {
  getAllOrders,
  getOrderByIdRecord,
  createOrderRecord,
  updateOrderRecord,
  deleteOrderRecord,
} from '../services/orderService.js';

const sendResponse = (res, statusCode, success, data, message) => {
  return res.status(statusCode).json({
    success,
    data,
    message,
  });
};

export const getOrders = async (req, res) => {
  try {
    const orders = await getAllOrders();
    return sendResponse(res, 200, true, orders, 'Pedidos consultados correctamente');
  } catch (error) {
    return sendResponse(res, 500, false, null, 'No se pudieron consultar los pedidos');
  }
};

export const getOrderById = async (req, res) => {
  const { id } = req.params;

  try {
    const order = await getOrderByIdRecord(id);
    return sendResponse(res, 200, true, order, 'Pedido consultado correctamente');
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return sendResponse(res, statusCode, false, null, error.message || 'No se pudo consultar el pedido');
  }
};

export const createOrder = async (req, res) => {
  const { items, total, shippingAddress, customer, invoice, status } = req.body;
  const authenticatedUserId = req.user?._id;

  try {
    const order = await createOrderRecord({
      items,
      total,
      shippingAddress,
      customer,
      invoice,
      status,
      userId: authenticatedUserId,
      userName: req.user?.name,
    });
    return sendResponse(res, 201, true, order, 'Orden creada correctamente');
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return sendResponse(res, statusCode, false, null, error.message || 'No se pudo crear la orden');
  }
};

export const updateOrder = async (req, res) => {
  const { id } = req.params;
  const { status, total, customer, invoice, shippingAddress } = req.body;

  try {
    const order = await updateOrderRecord(id, {
      status,
      total,
      customer,
      invoice,
      shippingAddress,
    });
    return sendResponse(res, 200, true, order, 'Pedido actualizado correctamente');
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return sendResponse(res, statusCode, false, null, error.message || 'No se pudo actualizar la orden');
  }
};

export const deleteOrder = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await deleteOrderRecord(id);
    return sendResponse(res, 200, true, result, 'Pedido eliminado correctamente');
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return sendResponse(res, statusCode, false, null, error.message || 'No se pudo eliminar la orden');
  }
};
