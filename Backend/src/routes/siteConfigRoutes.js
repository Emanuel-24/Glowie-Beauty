import express from 'express';

import {
  getSiteConfig,
  updateSiteConfig,
} from '../controllers/siteConfigController.js';
import { protect, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getSiteConfig);
router.put('/', protect, requireAdmin, updateSiteConfig);

export default router;
