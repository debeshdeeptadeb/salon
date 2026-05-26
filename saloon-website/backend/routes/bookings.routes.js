import express from 'express';
import {
    createBooking,
    getAllBookings,
    getBooking,
    updateBookingStatus,
    deleteBooking,
    getBookingStats,
    markPaymentPaid,
    confirmPayment,
    getAvailability,
} from '../controllers/bookings.controller.js';
import { protect } from '../middleware/auth.js';
import { publicSalonFromQuery, requireSalonContext } from '../middleware/salonContext.js';
import { uploadPaymentScreenshot } from '../middleware/uploadPayment.js';

const router = express.Router();

router.get('/availability', publicSalonFromQuery, getAvailability);
router.post('/', publicSalonFromQuery, createBooking);
router.patch(
    '/:id/confirm-payment',
    publicSalonFromQuery,
    uploadPaymentScreenshot.single('payment_screenshot'),
    confirmPayment
);

router.get('/stats', protect, requireSalonContext, getBookingStats);
router.get('/', protect, requireSalonContext, getAllBookings);
router.get('/:id', protect, requireSalonContext, getBooking);
router.put('/:id/status', protect, requireSalonContext, updateBookingStatus);
router.patch('/:id/mark-paid', protect, requireSalonContext, markPaymentPaid);
router.delete('/:id', protect, requireSalonContext, deleteBooking);

export default router;
