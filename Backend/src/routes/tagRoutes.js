import express from 'express';

import {
  getTags,
  createTag,
  deleteTag,
} from '../controllers/tagController.js';
import { protect, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getTags);
router.post('/', protect, requireAdmin, createTag);
router.delete('/:id', protect, requireAdmin, deleteTag);

export default router;
