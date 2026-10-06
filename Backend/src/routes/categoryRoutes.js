import express from 'express';

import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { protect, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getCategories);
router.post('/', protect, requireAdmin, createCategory);
router.put('/:id', protect, requireAdmin, updateCategory);
router.delete('/:id', protect, requireAdmin, deleteCategory);

export default router;
