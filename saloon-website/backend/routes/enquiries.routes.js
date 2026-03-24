import express from 'express';
import {
    submitEnquiry,
    getEnquiries,
    resolveEnquiry,
    deleteEnquiry
} from '../controllers/enquiries.controller.js';
import { protect } from '../middleware/auth.js';
import { publicSalonFromQuery, requireSalonContext } from '../middleware/salonContext.js';

const router = express.Router();

router.post('/', publicSalonFromQuery, submitEnquiry);
router.get('/', protect, requireSalonContext, getEnquiries);
router.put('/:id/resolve', protect, requireSalonContext, resolveEnquiry);
router.delete('/:id', protect, requireSalonContext, deleteEnquiry);

export default router;
