import express from 'express';

import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById,
} from '../controllers/productController.js';
import { protect, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', protect, requireAdmin, createProduct);
router.put('/:id', protect, requireAdmin, updateProduct);
router.delete('/:id', protect, requireAdmin, deleteProduct);

export default router;
