import express from 'express';

import {
  getPayments,
  getOrderPayments,
  createPayment,
  cancelPayment,
} from '../controllers/paymentController.js';
import { protect, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, requireAdmin, getPayments);
router.get('/order/:orderId', protect, requireAdmin, getOrderPayments);
router.post('/', protect, requireAdmin, createPayment);
router.put('/:id/anular', protect, requireAdmin, cancelPayment);

export default router;
