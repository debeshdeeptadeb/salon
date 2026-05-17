import express from 'express';
import { getAboutContent, updateAboutContent } from '../controllers/content.controller.js';
import { protect } from '../middleware/auth.js';
import { requireSuperAdmin } from '../middleware/salonContext.js';

const router = express.Router();

/** Public About is platform-wide (founder / company), not per salon. */
router.get('/about', getAboutContent);
/** Only the platform owner may edit About copy. */
router.put('/about', protect, requireSuperAdmin, updateAboutContent);

export default router;
