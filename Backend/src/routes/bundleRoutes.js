import express from 'express';
import {
  getBundles,
  getBundleById,
  createBundle,
  updateBundle,
  deleteBundle,
} from '../controllers/bundleController.js';
import { protect, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getBundles);
router.get('/:id', getBundleById);
router.post('/', protect, requireAdmin, createBundle);
router.put('/:id', protect, requireAdmin, updateBundle);
router.patch('/:id', protect, requireAdmin, updateBundle);
router.delete('/:id', protect, requireAdmin, deleteBundle);

export default router;
