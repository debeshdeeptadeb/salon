import express from 'express';
import {
    getServices,
    getService,
    createService,
    updateService,
    deleteService,
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory
} from '../controllers/services.controller.js';
import { protect } from '../middleware/auth.js';
import { publicSalonFromQuery, requireSalonContext } from '../middleware/salonContext.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.get('/categories/all', publicSalonFromQuery, getCategories);
router.get('/', publicSalonFromQuery, getServices);
router.get('/:id', publicSalonFromQuery, getService);

router.post('/', protect, requireSalonContext, upload.single('image'), createService);
router.put('/:id', protect, requireSalonContext, upload.single('image'), updateService);
router.delete('/:id', protect, requireSalonContext, deleteService);

router.post('/categories', protect, requireSalonContext, createCategory);
router.put('/categories/:id', protect, requireSalonContext, updateCategory);
router.delete('/categories/:id', protect, requireSalonContext, deleteCategory);

export default router;
