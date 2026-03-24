import express from 'express';
import {
    createBooking,
    getAllBookings,
    getBooking,
    updateBookingStatus,
    deleteBooking,
    getBookingStats,
    markPaymentPaid
} from '../controllers/bookings.controller.js';
import { protect } from '../middleware/auth.js';
import { publicSalonFromQuery, requireSalonContext } from '../middleware/salonContext.js';

const router = express.Router();

router.post('/', publicSalonFromQuery, createBooking);

router.get('/stats', protect, requireSalonContext, getBookingStats);
router.get('/', protect, requireSalonContext, getAllBookings);
router.get('/:id', protect, requireSalonContext, getBooking);
router.put('/:id/status', protect, requireSalonContext, updateBookingStatus);
router.patch('/:id/mark-paid', protect, requireSalonContext, markPaymentPaid);
router.delete('/:id', protect, requireSalonContext, deleteBooking);

export default router;
