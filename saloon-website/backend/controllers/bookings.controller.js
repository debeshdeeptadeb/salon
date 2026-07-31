import pool from '../config/database.js';
import { generateWhatsAppURLs } from '../services/whatsapp.service.js';
import { notifyBookingCreated, notifyPaymentSubmitted } from '../services/notification.service.js';

const VALID_PAYMENT_METHODS = ['upi_online', 'pay_at_salon'];
const VALID_PAYMENT_STATUSES = ['pending', 'paid', 'pay_at_salon'];

function normalizeTime(timeStr) {
    const [h, m] = String(timeStr).split(':');
    return `${h.padStart(2, '0')}:${(m || '00').padStart(2, '0')}`;
}

async function isSlotTaken(salonId, bookingDate, bookingTime, branch, excludeBookingId = null) {
    const params = [salonId, bookingDate, normalizeTime(bookingTime), branch];
    let query = `
        SELECT id FROM bookings
        WHERE salon_id = $1
          AND booking_date = $2
          AND booking_time::text LIKE $3 || '%'
          AND branch = $4
          AND status != 'cancelled'
    `;
    if (excludeBookingId) {
        query += ' AND id != $5';
        params.push(excludeBookingId);
    }
    query += ' LIMIT 1';
    const result = await pool.query(query, params);
    return result.rows.length > 0;
}

async function getSalonName(salonId) {
    const settings = await pool.query(
        'SELECT site_name FROM site_settings WHERE salon_id = $1 LIMIT 1',
        [salonId]
    );
    if (settings.rows[0]?.site_name) return settings.rows[0].site_name;
    const salon = await pool.query('SELECT name FROM salons WHERE id = $1', [salonId]);
    return salon.rows[0]?.name || 'Salon';
}

export const getAvailability = async (req, res, next) => {
    try {
        const salonId = req.publicSalonId;
        const { date, branch } = req.query;

        if (!date || !branch) {
            return res.status(400).json({
                success: false,
                error: 'date and branch are required',
            });
        }

        const result = await pool.query(
            `SELECT booking_time::text AS booking_time
             FROM bookings
             WHERE salon_id = $1
               AND booking_date = $2
               AND branch = $3
               AND status != 'cancelled'`,
            [salonId, date, branch]
        );

        const bookedTimes = result.rows.map((row) => {
            const t = row.booking_time;
            return normalizeTime(t.length > 5 ? t.slice(0, 5) : t);
        });

        res.status(200).json({
            success: true,
            data: { bookedTimes: [...new Set(bookedTimes)] },
        });
    } catch (error) {
        next(error);
    }
};

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
            payment_status,
            payment_method,
        } = req.body;

        const isQRBooking = !!qr_source_id;
        const resolvedBranch = branch || 'Walk-in';
        const resolvedPaymentMethod = VALID_PAYMENT_METHODS.includes(payment_method)
            ? payment_method
            : 'upi_online';

        if (!customer_name || !customer_phone || !service_id || !booking_date || !booking_time) {
            return res.status(400).json({
                success: false,
                error: 'Please provide all required fields',
            });
        }

        if (!isQRBooking) {
            if (!branch) {
                return res.status(400).json({
                    success: false,
                    error: 'Please provide all required fields',
                });
            }
            const validBranches = ['Cuttack', 'Bhubaneswar', 'Baripada'];
            if (!validBranches.includes(branch)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid branch selected',
                });
            }
        }

        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(customer_phone.replace(/\D/g, ''))) {
            return res.status(400).json({
                success: false,
                error: 'Please provide a valid 10-digit phone number',
            });
        }

        const slotTaken = await isSlotTaken(salonId, booking_date, booking_time, resolvedBranch);
        if (slotTaken) {
            return res.status(409).json({
                success: false,
                error: 'This time slot is no longer available. Please choose another time.',
            });
        }

        const serviceCheck = await pool.query(
            'SELECT id, name, price FROM services WHERE id = $1 AND is_active = true AND salon_id = $2',
            [service_id, salonId]
        );

        if (serviceCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Service not found or inactive',
            });
        }

        const service = serviceCheck.rows[0];

        let finalPaymentStatus = payment_status || 'pending';
        if (resolvedPaymentMethod === 'pay_at_salon') {
            finalPaymentStatus = 'pay_at_salon';
        } else if (!VALID_PAYMENT_STATUSES.includes(finalPaymentStatus)) {
            finalPaymentStatus = 'pending';
        }

        const result = await pool.query(
            `INSERT INTO bookings 
            (salon_id, customer_name, customer_phone, customer_email, service_id, booking_date, booking_time, branch, notes, status, qr_source_id, payment_status, payment_method)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending', $10, $11, $12)
            RETURNING *`,
            [
                salonId,
                customer_name,
                customer_phone,
                customer_email || null,
                service_id,
                booking_date,
                booking_time,
                resolvedBranch,
                notes || null,
                qr_source_id || null,
                finalPaymentStatus,
                resolvedPaymentMethod,
            ]
        );

        const booking = result.rows[0];
        const salonName = await getSalonName(salonId);

        notifyBookingCreated(booking, service, salonName).catch((err) => {
            console.error('[bookings] notification error:', err.message);
        });

        if (isQRBooking) {
            return res.status(201).json({
                success: true,
                data: booking,
            });
        }

        const bookingWithService = {
            ...booking,
            service_name: service.name,
            service_price: service.price,
        };

        const whatsappURLs = generateWhatsAppURLs(bookingWithService);

        res.status(201).json({
            success: true,
            data: booking,
            whatsappURLs,
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
            data: result.rows,
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
                error: 'Booking not found',
            });
        }

        res.status(200).json({
            success: true,
            data: result.rows[0],
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
                error: 'Invalid status value',
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
                error: 'Booking not found',
            });
        }

        res.status(200).json({
            success: true,
            data: result.rows[0],
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
                error: 'Booking not found',
            });
        }

        res.status(200).json({
            success: true,
            data: {},
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
            data: result.rows[0],
        });
    } catch (error) {
        next(error);
    }
};

export const confirmPayment = async (req, res, next) => {
    try {
        const salonId = req.publicSalonId;
        const { customer_phone, payment_reference } = req.body;
        const bookingId = req.params.id;

        if (!customer_phone) {
            return res.status(400).json({
                success: false,
                error: 'Phone number is required to confirm payment',
            });
        }

        const phone = customer_phone.replace(/\D/g, '');
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({
                success: false,
                error: 'Please provide a valid 10-digit phone number',
            });
        }

        const existing = await pool.query(
            `SELECT b.*, s.name AS service_name, s.price AS service_price
             FROM bookings b
             LEFT JOIN services s ON b.service_id = s.id
             WHERE b.id = $1 AND b.salon_id = $2`,
            [bookingId, salonId]
        );

        if (existing.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Booking not found',
            });
        }

        const row = existing.rows[0];
        const bookingPhone = row.customer_phone.replace(/\D/g, '');
        if (bookingPhone !== phone) {
            return res.status(403).json({
                success: false,
                error: 'Phone number does not match this booking',
            });
        }

        const ref = payment_reference?.trim().slice(0, 50) || null;
        const screenshotUrl = req.file ? `/uploads/payments/${req.file.filename}` : null;

        if (row.payment_method !== 'pay_at_salon') {
            if (!screenshotUrl && !row.payment_screenshot_url) {
                return res.status(400).json({
                    success: false,
                    error: 'Payment screenshot is required. Please upload your UPI payment proof.',
                });
            }
            if (!ref || ref.replace(/\s/g, '').length < 8) {
                return res.status(400).json({
                    success: false,
                    error: 'Enter a valid UPI UTR / transaction reference (at least 8 characters).',
                });
            }
        }

        const result = await pool.query(
            `UPDATE bookings
            SET payment_reference = COALESCE($1, payment_reference),
                payment_screenshot_url = COALESCE($2, payment_screenshot_url),
                payment_confirmed_at = CURRENT_TIMESTAMP,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $3 AND salon_id = $4
            RETURNING *`,
            [ref, screenshotUrl, bookingId, salonId]
        );

        const booking = result.rows[0];
        const salonName = await getSalonName(salonId);
        const service = {
            name: row.service_name,
            price: row.service_price,
        };

        notifyPaymentSubmitted(booking, service, salonName).catch(() => {});

        const bookingWithService = {
            ...booking,
            service_name: row.service_name,
            service_price: row.service_price,
        };

        res.status(200).json({
            success: true,
            data: booking,
            whatsappURLs: generateWhatsAppURLs(bookingWithService),
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
                error: 'Booking not found',
            });
        }

        res.status(200).json({
            success: true,
            data: result.rows[0],
        });
    } catch (error) {
        next(error);
    }
};
