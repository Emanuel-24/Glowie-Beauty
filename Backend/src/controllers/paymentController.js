import {
  getAllPayments,
  getOrderPaymentsRecord,
  createPaymentRecord,
  cancelPaymentRecord,
} from '../services/paymentService.js';

const sendResponse = (res, statusCode, success, data, message) => {
  return res.status(statusCode).json({
    success,
    data,
    message,
  });
};

export const getPayments = async (req, res) => {
  try {
    const payments = await getAllPayments();
    return sendResponse(res, 200, true, payments, 'Pagos consultados correctamente');
  } catch (error) {
    return sendResponse(res, 500, false, null, 'No se pudieron consultar los pagos');
  }
};

export const getOrderPayments = async (req, res) => {
  const { orderId } = req.params;

  try {
    const data = await getOrderPaymentsRecord(orderId);
    return sendResponse(res, 200, true, data, 'Historial de pagos consultado');
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return sendResponse(res, statusCode, false, null, error?.message || 'No se pudo consultar el historial de pagos');
  }
};

export const createPayment = async (req, res) => {
  const { orderId, amount, method, reference = '', note = '', idempotencyKey } = req.body;

  try {
    const result = await createPaymentRecord({
      orderId,
      amount,
      method,
      reference,
      note,
      idempotencyKey,
      registeredByUserId: req.user?._id,
    });

    if (result.alreadyProcessed) {
      return sendResponse(res, 200, true, result.payment, 'Pago ya registrado');
    }

    return sendResponse(res, 201, true, {
      payment: result.payment,
      order: result.order,
    }, 'Abono registrado correctamente');
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return sendResponse(res, statusCode, false, null, error?.message || 'No se pudo registrar el pago');
  }
};

export const cancelPayment = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await cancelPaymentRecord(id);
    return sendResponse(res, 200, true, result, 'Pago anulado correctamente');
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return sendResponse(res, statusCode, false, null, error?.message || 'No se pudo anular el pago');
  }
};
