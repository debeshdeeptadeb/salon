import bcrypt from 'bcryptjs';
import pool from '../config/database.js';

// @desc    List salon admins (staff)
// @route   GET /api/salon-staff?salonId=
export const listSalonStaff = async (req, res, next) => {
    try {
        let salonId;
        if (req.user.role === 'super_admin') {
            const raw = req.query.salonId || req.headers['x-salon-id'];
            if (!raw) {
                return res.status(400).json({
                    success: false,
                    error: 'Provide salonId query or select a salon (X-Salon-Id)',
                });
            }
            salonId = parseInt(raw, 10);
        } else {
            salonId = req.user.salon_id;
        }
        if (!salonId) {
            return res.status(400).json({ success: false, error: 'No salon' });
        }

        const result = await pool.query(
            `SELECT id, email, name, role, salon_id, created_at
             FROM admins
             WHERE salon_id = $1 AND role = 'salon_admin'
             ORDER BY created_at ASC`,
            [salonId]
        );
        res.status(200).json({ success: true, data: result.rows });
    } catch (e) {
        next(e);
    }
};

// @desc    Create salon admin (staff) for a tenant
// @route   POST /api/salon-staff
export const createSalonStaff = async (req, res, next) => {
    try {
        const { email, password, name, salon_id: bodySalonId } = req.body;
        if (!email?.trim() || !password || !name?.trim()) {
            return res.status(400).json({
                success: false,
                error: 'email, password, and name are required',
            });
        }

        let targetSalonId;
        if (req.user.role === 'super_admin') {
            if (!bodySalonId) {
                return res.status(400).json({ success: false, error: 'salon_id is required' });
            }
            targetSalonId = parseInt(bodySalonId, 10);
        } else {
            targetSalonId = req.user.salon_id;
        }

        if (!targetSalonId) {
            return res.status(400).json({ success: false, error: 'Invalid salon' });
        }

        const salonCheck = await pool.query('SELECT id FROM salons WHERE id = $1', [targetSalonId]);
        if (salonCheck.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Salon not found' });
        }

        const exists = await pool.query('SELECT id FROM admins WHERE email = $1', [
            email.trim().toLowerCase(),
        ]);
        if (exists.rows.length > 0) {
            return res.status(400).json({ success: false, error: 'Email already registered' });
        }

        const hash = await bcrypt.hash(password, 10);
        const result = await pool.query(
            `INSERT INTO admins (email, password, name, role, salon_id)
             VALUES ($1, $2, $3, 'salon_admin', $4)
             RETURNING id, email, name, role, salon_id, created_at`,
            [email.trim().toLowerCase(), hash, name.trim(), targetSalonId]
        );

        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (e) {
        next(e);
    }
};

// @desc    Remove staff user (not self)
// @route   DELETE /api/salon-staff/:id
export const deleteSalonStaff = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        const row = await pool.query('SELECT id, salon_id, role FROM admins WHERE id = $1', [id]);
        if (row.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        const target = row.rows[0];
        if (target.role !== 'salon_admin') {
            return res.status(400).json({ success: false, error: 'Cannot remove this account' });
        }
        if (req.user.role === 'salon_admin') {
            if (target.salon_id !== req.user.salon_id) {
                return res.status(403).json({ success: false, error: 'Not allowed' });
            }
            if (target.id === req.user.id) {
                return res.status(400).json({ success: false, error: 'You cannot remove your own account' });
            }
        }

        await pool.query('DELETE FROM admins WHERE id = $1', [id]);
        res.status(200).json({ success: true, data: {} });
    } catch (e) {
        next(e);
    }
};
