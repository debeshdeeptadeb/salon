import pool from '../config/database.js';

export const getCatalogueItems = async (req, res, next) => {
    try {
        const salonId = req.publicSalonId;
        const result = await pool.query(
            `SELECT c.*, s.name as service_name 
       FROM catalogue_items c
       LEFT JOIN services s ON c.service_id = s.id
       WHERE c.is_visible = true AND c.salon_id = $1
       ORDER BY c.display_order, c.created_at DESC`,
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

export const getCatalogueItem = async (req, res, next) => {
    try {
        const salonId = req.publicSalonId;
        const result = await pool.query(
            `SELECT c.*, s.name as service_name 
       FROM catalogue_items c
       LEFT JOIN services s ON c.service_id = s.id
       WHERE c.id = $1 AND c.salon_id = $2`,
            [req.params.id, salonId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Catalogue item not found'
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

export const createCatalogueItem = async (req, res, next) => {
    try {
        const salonId = req.effectiveSalonId;
        const { service_id, title, description, price, duration, display_order } = req.body;

        if (service_id) {
            const s = await pool.query('SELECT id FROM services WHERE id = $1 AND salon_id = $2', [
                service_id,
                salonId
            ]);
            if (s.rows.length === 0) {
                return res.status(400).json({ success: false, error: 'Invalid service' });
            }
        }

        const image_url = req.file ? `/uploads/${req.file.filename}` : null;

        const result = await pool.query(
            `INSERT INTO catalogue_items (salon_id, service_id, title, description, price, duration, image_url, display_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
            [salonId, service_id || null, title, description, price, duration, image_url, display_order || 0]
        );

        res.status(201).json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        next(error);
    }
};

export const updateCatalogueItem = async (req, res, next) => {
    try {
        const salonId = req.effectiveSalonId;
        const { service_id, title, description, price, duration, is_visible, display_order } = req.body;

        if (service_id) {
            const s = await pool.query('SELECT id FROM services WHERE id = $1 AND salon_id = $2', [
                service_id,
                salonId
            ]);
            if (s.rows.length === 0) {
                return res.status(400).json({ success: false, error: 'Invalid service' });
            }
        }

        let image_url = req.body.image_url;
        if (req.file) {
            image_url = `/uploads/${req.file.filename}`;
        }

        const result = await pool.query(
            `UPDATE catalogue_items 
       SET service_id = $1, title = $2, description = $3, price = $4, 
           duration = $5, image_url = $6, is_visible = $7, display_order = $8,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $9 AND salon_id = $10
       RETURNING *`,
            [service_id, title, description, price, duration, image_url, is_visible, display_order, req.params.id, salonId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Catalogue item not found'
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

export const deleteCatalogueItem = async (req, res, next) => {
    try {
        const salonId = req.effectiveSalonId;
        const result = await pool.query(
            'DELETE FROM catalogue_items WHERE id = $1 AND salon_id = $2 RETURNING *',
            [req.params.id, salonId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Catalogue item not found'
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
