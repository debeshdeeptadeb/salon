import express from 'express';
import { getSettings, updateSettings, uploadLogo, uploadUpiQR } from '../controllers/settings.controller.js';
import { protect } from '../middleware/auth.js';
import { publicSalonFromQuery, requireSalonContext } from '../middleware/salonContext.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.get('/', publicSalonFromQuery, getSettings);

router.put('/', protect, requireSalonContext, updateSettings);
router.post('/logo', protect, requireSalonContext, upload.single('logo'), uploadLogo);
router.post('/upi-qr', protect, requireSalonContext, upload.single('upiQr'), uploadUpiQR);

export default router;
