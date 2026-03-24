import express from 'express';
import {
    getHeroContent,
    updateHeroContent,
    getServicesPreview,
    updateServicesPreview,
    uploadServiceImage,
    getPrices,
    updatePrices
} from '../controllers/homeContent.controller.js';
import { protect } from '../middleware/auth.js';
import { publicSalonFromQuery, requireSalonContext } from '../middleware/salonContext.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.get('/hero', publicSalonFromQuery, getHeroContent);
router.get('/services', publicSalonFromQuery, getServicesPreview);
router.get('/prices', publicSalonFromQuery, getPrices);

router.put('/hero', protect, requireSalonContext, updateHeroContent);
router.put('/services', protect, requireSalonContext, updateServicesPreview);
router.post('/services/image', protect, requireSalonContext, upload.single('image'), uploadServiceImage);
router.put('/prices', protect, requireSalonContext, updatePrices);

export default router;
