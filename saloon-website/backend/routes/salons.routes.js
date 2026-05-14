import express from 'express';
import {
    listSalons,
    createSalon,
    getPublicSalon,
    discoverSalons,
    listPublicSalonsDirectory,
    getSalonById,
    patchSalon,
} from '../controllers/salons.controller.js';
import { protect } from '../middleware/auth.js';
import { requireSuperAdmin } from '../middleware/salonContext.js';

const router = express.Router();

router.get('/discover', discoverSalons);
router.get('/directory', listPublicSalonsDirectory);
router.get('/public/:slug', getPublicSalon);
router.get('/', protect, requireSuperAdmin, listSalons);
router.post('/', protect, requireSuperAdmin, createSalon);
router.get('/:id', protect, getSalonById);
router.patch('/:id', protect, patchSalon);

export default router;
