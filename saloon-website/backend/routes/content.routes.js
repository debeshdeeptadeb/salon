import express from 'express';
import { getAboutContent, updateAboutContent } from '../controllers/content.controller.js';
import { protect } from '../middleware/auth.js';
import { publicSalonFromQuery, requireSalonContext } from '../middleware/salonContext.js';

const router = express.Router();

router.get('/about', publicSalonFromQuery, getAboutContent);
router.put('/about', protect, requireSalonContext, updateAboutContent);

export default router;
