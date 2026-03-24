import express from 'express';
import {
    generateQRCode,
    getQRCodes,
    getQRCodeById,
    deleteQRCode,
    toggleQRCodeStatus,
    getServicesByQRCode
} from '../controllers/qr.controller.js';
import { protect } from '../middleware/auth.js';
import { requireSalonContext } from '../middleware/salonContext.js';

const router = express.Router();

router.get('/:qrCodeId/services', getServicesByQRCode);

router.post('/generate', protect, requireSalonContext, generateQRCode);
router.get('/', protect, requireSalonContext, getQRCodes);
router.get('/:id', protect, requireSalonContext, getQRCodeById);
router.delete('/:id', protect, requireSalonContext, deleteQRCode);
router.patch('/:id/toggle', protect, requireSalonContext, toggleQRCodeStatus);

export default router;
