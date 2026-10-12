import {
  getAllOrders,
  getOrdersByUser,
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
    const isAdmin = req.user?.role?.toLowerCase() === 'admin';
    const orders = isAdmin
      ? await getAllOrders()
      : await getOrdersByUser({ userId: req.user?._id, email: req.user?.email });
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
  const authenticatedUserId = req.user?._id;
  const userName = req.user?.name;

  try {
    const order = await createOrderRecord({
      ...req.body,
      userId: authenticatedUserId || req.body.userId,
      userName,
    });
    return sendResponse(res, 201, true, order, 'Orden creada correctamente');
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return sendResponse(res, statusCode, false, null, error.message || 'No se pudo crear la orden');
  }
};

export const updateOrder = async (req, res) => {
  const { id } = req.params;

  try {
    const order = await updateOrderRecord(id, req.body);
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
