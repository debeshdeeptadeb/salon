import pool from '../config/database.js';

export const getActiveOffer = async (req, res, next) => {
    try {
        const salonId = req.publicSalonId;
        const result = await pool.query(
            `SELECT * FROM offers 
       WHERE salon_id = $1 AND is_active = true 
       AND (start_date IS NULL OR start_date <= CURRENT_TIMESTAMP)
       AND (end_date IS NULL OR end_date >= CURRENT_TIMESTAMP)
       ORDER BY created_at DESC 
       LIMIT 1`,
            [salonId]
        );

        res.status(200).json({
            success: true,
            data: result.rows[0] || null
        });
    } catch (error) {
        next(error);
    }
};

export const getOffers = async (req, res, next) => {
    try {
        const salonId = req.effectiveSalonId;
        const result = await pool.query(
            'SELECT * FROM offers WHERE salon_id = $1 ORDER BY created_at DESC',
            [salonId]
        );

        res.status(200).json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });
    } catch (error) {
        next(error);
    }
};

export const createOffer = async (req, res, next) => {
    try {
        const salonId = req.effectiveSalonId;
        const { title, description, is_active, start_date, end_date } = req.body;

        const result = await pool.query(
            `INSERT INTO offers (salon_id, title, description, is_active, start_date, end_date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
            [salonId, title, description, is_active || false, start_date || null, end_date || null]
        );

        res.status(201).json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        next(error);
    }
};

export const updateOffer = async (req, res, next) => {
    try {
        const salonId = req.effectiveSalonId;
        const { title, description, is_active, start_date, end_date } = req.body;

        const result = await pool.query(
            `UPDATE offers 
       SET title = $1, description = $2, is_active = $3, start_date = $4, end_date = $5,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 AND salon_id = $7
       RETURNING *`,
            [title, description, is_active, start_date, end_date, req.params.id, salonId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Offer not found'
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

export const deleteOffer = async (req, res, next) => {
    try {
        const salonId = req.effectiveSalonId;
        const result = await pool.query(
            'DELETE FROM offers WHERE id = $1 AND salon_id = $2 RETURNING *',
            [req.params.id, salonId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Offer not found'
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
