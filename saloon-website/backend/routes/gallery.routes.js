import express from 'express';
import {
    getGalleryImages,
    uploadGalleryImage,
    deleteGalleryImage,
    updateGalleryImage
} from '../controllers/gallery.controller.js';
import { protect } from '../middleware/auth.js';
import { publicSalonFromQuery, requireSalonContext } from '../middleware/salonContext.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.get('/', publicSalonFromQuery, getGalleryImages);
router.post('/', protect, requireSalonContext, upload.single('image'), uploadGalleryImage);
router.put('/:id', protect, requireSalonContext, updateGalleryImage);
router.delete('/:id', protect, requireSalonContext, deleteGalleryImage);

export default router;
