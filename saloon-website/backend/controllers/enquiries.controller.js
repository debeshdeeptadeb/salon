import pool from '../config/database.js';

export const submitEnquiry = async (req, res, next) => {
    try {
        const salonId = req.publicSalonId;
        const { name, phone, email, message } = req.body;

        if (!name || !phone || !message) {
            return res.status(400).json({
                success: false,
                error: 'Please provide name, phone, and message'
            });
        }

        const result = await pool.query(
            `INSERT INTO enquiries (salon_id, name, phone, email, message)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
            [salonId, name, phone, email || null, message]
        );

        res.status(201).json({
            success: true,
            data: result.rows[0],
            message: 'Thank you for your enquiry. We will contact you soon!'
        });
    } catch (error) {
        next(error);
    }
};

export const getEnquiries = async (req, res, next) => {
    try {
        const salonId = req.effectiveSalonId;
        const { resolved } = req.query;

        let query = 'SELECT * FROM enquiries WHERE salon_id = $1';
        const params = [salonId];

        if (resolved !== undefined) {
            query += ' AND is_resolved = $2';
            params.push(resolved === 'true');
        }

        query += ' ORDER BY created_at DESC';

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

export const resolveEnquiry = async (req, res, next) => {
    try {
        const salonId = req.effectiveSalonId;
        const result = await pool.query(
            `UPDATE enquiries 
       SET is_resolved = true, resolved_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND salon_id = $2
       RETURNING *`,
            [req.params.id, salonId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Enquiry not found'
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

export const deleteEnquiry = async (req, res, next) => {
    try {
        const salonId = req.effectiveSalonId;
        const result = await pool.query(
            'DELETE FROM enquiries WHERE id = $1 AND salon_id = $2 RETURNING *',
            [req.params.id, salonId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Enquiry not found'
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
