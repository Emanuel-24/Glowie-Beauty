import express from 'express';

import {
  createUser,
  getUsers,
  updateUser,
  deleteUser,
} from '../controllers/userController.js';
import { protect, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, requireAdmin, getUsers);
router.post('/', protect, requireAdmin, createUser);
router.put('/:id', protect, requireAdmin, updateUser);
router.patch('/:id', protect, requireAdmin, updateUser);
router.delete('/:id', protect, requireAdmin, deleteUser);

export default router;
