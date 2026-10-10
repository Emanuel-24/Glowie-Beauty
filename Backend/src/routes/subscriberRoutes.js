import express from 'express';
import { subscribe, getSubscribers } from '../controllers/subscriberController.js';
import { protect, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.post('/subscribe', subscribe);
router.get('/', protect, requireAdmin, getSubscribers);

export default router;
