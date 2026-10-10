import express from 'express';

import {
  createOrder,
  getOrders,
  updateOrder,
  deleteOrder,
} from '../controllers/orderController.js';
import { protect, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, requireAdmin, getOrders);
router.post('/', protect, createOrder);
router.put('/:id', protect, requireAdmin, updateOrder);
router.patch('/:id', protect, requireAdmin, updateOrder);
router.delete('/:id', protect, requireAdmin, deleteOrder);

export default router;
