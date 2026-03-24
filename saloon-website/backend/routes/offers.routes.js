import express from 'express';
import {
    getActiveOffer,
    getOffers,
    createOffer,
    updateOffer,
    deleteOffer
} from '../controllers/offers.controller.js';
import { protect } from '../middleware/auth.js';
import { publicSalonFromQuery, requireSalonContext } from '../middleware/salonContext.js';

const router = express.Router();

router.get('/active', publicSalonFromQuery, getActiveOffer);
router.get('/', protect, requireSalonContext, getOffers);
router.post('/', protect, requireSalonContext, createOffer);
router.put('/:id', protect, requireSalonContext, updateOffer);
router.delete('/:id', protect, requireSalonContext, deleteOffer);

export default router;
