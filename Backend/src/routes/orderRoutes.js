import express from 'express';

import {
  createOrder,
  getOrders,
  updateOrder,
  deleteOrder,
} from '../controllers/orderController.js';
import { protect, requireAdmin, optionalProtect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getOrders);
router.post('/', optionalProtect, createOrder);
router.put('/:id', protect, requireAdmin, updateOrder);
router.patch('/:id', protect, requireAdmin, updateOrder);
router.delete('/:id', protect, requireAdmin, deleteOrder);

export default router;
