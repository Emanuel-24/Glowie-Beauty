import express from 'express';

import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById,
  getTopSeller,
  getOffers,
  batchUpdateOffers,
} from '../controllers/productController.js';
import { protect, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/top-seller', getTopSeller);
router.get('/offers', getOffers);
router.patch('/batch-offers', protect, requireAdmin, batchUpdateOffers);
router.get('/:id', getProductById);
router.post('/', protect, requireAdmin, createProduct);
router.put('/:id', protect, requireAdmin, updateProduct);
router.patch('/:id', protect, requireAdmin, updateProduct);
router.delete('/:id', protect, requireAdmin, deleteProduct);

export default router;
