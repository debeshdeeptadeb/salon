import express from 'express';
import {
    getCatalogueItems,
    getCatalogueItem,
    createCatalogueItem,
    updateCatalogueItem,
    deleteCatalogueItem
} from '../controllers/catalogue.controller.js';
import { protect } from '../middleware/auth.js';
import { publicSalonFromQuery, requireSalonContext } from '../middleware/salonContext.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.get('/', publicSalonFromQuery, getCatalogueItems);
router.get('/:id', publicSalonFromQuery, getCatalogueItem);
router.post('/', protect, requireSalonContext, upload.single('image'), createCatalogueItem);
router.put('/:id', protect, requireSalonContext, upload.single('image'), updateCatalogueItem);
router.delete('/:id', protect, requireSalonContext, deleteCatalogueItem);

export default router;
