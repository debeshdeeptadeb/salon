import pool from '../config/database.js';
import { generateWhatsAppURLs } from '../services/whatsapp.service.js';

export const createBooking = async (req, res, next) => {
    try {
        const salonId = req.publicSalonId;
        const {
            customer_name,
            customer_phone,
            customer_email,
            service_id,
            booking_date,
            booking_time,
            branch,
            notes,
            qr_source_id,
            payment_status
        } = req.body;

        const isQRBooking = !!qr_source_id;

        if (!customer_name || !customer_phone || !service_id || !booking_date || !booking_time) {
            return res.status(400).json({
                success: false,
                error: 'Please provide all required fields'
            });
        }

        if (!isQRBooking) {
            if (!branch) {
                return res.status(400).json({
                    success: false,
                    error: 'Please provide all required fields'
                });
            }
            const validBranches = ['Cuttack', 'Bhubaneswar', 'Baripada'];
            if (!validBranches.includes(branch)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid branch selected'
                });
            }
        }

        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(customer_phone.replace(/\D/g, ''))) {
            return res.status(400).json({
                success: false,
                error: 'Please provide a valid 10-digit phone number'
            });
        }

        const serviceCheck = await pool.query(
            'SELECT id, name, price FROM services WHERE id = $1 AND is_active = true AND salon_id = $2',
            [service_id, salonId]
        );

        if (serviceCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Service not found or inactive'
            });
        }

        const service = serviceCheck.rows[0];
        const finalPaymentStatus = payment_status || 'pending';

        const result = await pool.query(
            `INSERT INTO bookings 
            (salon_id, customer_name, customer_phone, customer_email, service_id, booking_date, booking_time, branch, notes, status, qr_source_id, payment_status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending', $10, $11)
            RETURNING *`,
            [salonId, customer_name, customer_phone, customer_email || null, service_id, booking_date, booking_time, branch || 'Walk-in', notes || null, qr_source_id || null, finalPaymentStatus]
        );

        const booking = result.rows[0];

        if (isQRBooking) {
            return res.status(201).json({
                success: true,
                data: booking
            });
        }

        const bookingWithService = {
            ...booking,
            service_name: service.name,
            service_price: service.price
        };

        const whatsappURLs = generateWhatsAppURLs(bookingWithService);

        res.status(201).json({
            success: true,
            data: booking,
            whatsappURLs: whatsappURLs
        });
    } catch (error) {
        next(error);
    }
};

export const getAllBookings = async (req, res, next) => {
    try {
        const salonId = req.effectiveSalonId;
        const { status, branch, date_from, date_to, search } = req.query;

        let query = `
            SELECT b.*, s.name as service_name, s.price as service_price, s.duration as service_duration
            FROM bookings b
            LEFT JOIN services s ON b.service_id = s.id
            WHERE b.salon_id = $1
        `;
        const params = [salonId];
        let paramCount = 2;

        if (status && status !== 'all') {
            query += ` AND b.status = $${paramCount}`;
            params.push(status);
            paramCount++;
        }

        if (branch && branch !== 'all') {
            query += ` AND b.branch = $${paramCount}`;
            params.push(branch);
            paramCount++;
        }

        if (date_from) {
            query += ` AND b.booking_date >= $${paramCount}`;
            params.push(date_from);
            paramCount++;
        }

        if (date_to) {
            query += ` AND b.booking_date <= $${paramCount}`;
            params.push(date_to);
            paramCount++;
        }

        if (search) {
            query += ` AND (b.customer_name ILIKE $${paramCount} OR b.customer_phone ILIKE $${paramCount})`;
            params.push(`%${search}%`);
            paramCount++;
        }

        query += ' ORDER BY b.booking_date DESC, b.booking_time DESC';

        const result = await pool.query(query, params);

        res.status(200).json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });
    } catch (error) {
        next(error);
    }
};

export const getBooking = async (req, res, next) => {
    try {
        const salonId = req.effectiveSalonId;
        const result = await pool.query(
            `SELECT b.*, s.name as service_name, s.price as service_price, s.duration as service_duration
            FROM bookings b
            LEFT JOIN services s ON b.service_id = s.id
            WHERE b.id = $1 AND b.salon_id = $2`,
            [req.params.id, salonId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Booking not found'
            });
        }

        res.status(200).json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        next(error);
    }
};

export const updateBookingStatus = async (req, res, next) => {
    try {
        const salonId = req.effectiveSalonId;
        const { status } = req.body;
        const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid status value'
            });
        }

        const result = await pool.query(
            `UPDATE bookings 
            SET status = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2 AND salon_id = $3
            RETURNING *`,
            [status, req.params.id, salonId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Booking not found'
            });
        }

        res.status(200).json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        next(error);
    }
};

export const deleteBooking = async (req, res, next) => {
    try {
        const salonId = req.effectiveSalonId;
        const result = await pool.query(
            'DELETE FROM bookings WHERE id = $1 AND salon_id = $2 RETURNING *',
            [req.params.id, salonId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Booking not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        next(error);
    }
};

export const getBookingStats = async (req, res, next) => {
    try {
        const salonId = req.effectiveSalonId;
        const statsQuery = `
            SELECT 
                COUNT(*) as total_bookings,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
                COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
                COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled,
                COUNT(CASE WHEN booking_date = CURRENT_DATE THEN 1 END) as today_bookings
            FROM bookings
            WHERE salon_id = $1
        `;

        const result = await pool.query(statsQuery, [salonId]);

        res.status(200).json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        next(error);
    }
};

export const markPaymentPaid = async (req, res, next) => {
    try {
        const salonId = req.effectiveSalonId;
        const result = await pool.query(
            `UPDATE bookings 
            SET payment_status = 'paid', updated_at = CURRENT_TIMESTAMP
            WHERE id = $1 AND salon_id = $2
            RETURNING *`,
            [req.params.id, salonId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Booking not found'
            });
        }

        res.status(200).json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        next(error);
    }
};
