import express from 'express';
import { listSalons, createSalon, getPublicSalon, discoverSalons } from '../controllers/salons.controller.js';
import { protect } from '../middleware/auth.js';
import { requireSuperAdmin } from '../middleware/salonContext.js';

const router = express.Router();

router.get('/discover', discoverSalons);
router.get('/public/:slug', getPublicSalon);
router.get('/', protect, requireSuperAdmin, listSalons);
router.post('/', protect, requireSuperAdmin, createSalon);

export default router;
