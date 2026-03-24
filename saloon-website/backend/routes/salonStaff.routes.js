import express from 'express';
import { listSalonStaff, createSalonStaff, deleteSalonStaff } from '../controllers/salonStaff.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, listSalonStaff);
router.post('/', protect, createSalonStaff);
router.delete('/:id', protect, deleteSalonStaff);

export default router;
