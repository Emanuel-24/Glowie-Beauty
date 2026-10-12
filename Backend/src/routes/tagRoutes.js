import express from 'express';

import {
  getTags,
  createTag,
  updateTag,
  deleteTag,
} from '../controllers/tagController.js';
import { protect, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getTags);
router.post('/', protect, requireAdmin, createTag);
router.put('/:id', protect, requireAdmin, updateTag);
router.delete('/:id', protect, requireAdmin, deleteTag);

export default router;
