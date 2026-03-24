import pool from '../config/database.js';

// @desc    Get all services
// @route   GET /api/services
// @access  Public — requires ?salon=slug (middleware sets req.publicSalonId)
export const getServices = async (req, res, next) => {
    try {
        const salonId = req.publicSalonId;
        const { category } = req.query;

        let query = `
      SELECT s.*, sc.name as category_name 
      FROM services s
      LEFT JOIN service_categories sc ON s.category_id = sc.id
      WHERE s.is_active = true AND s.salon_id = $1
    `;

        const params = [salonId];

        if (category) {
            query += ' AND sc.name = $2';
            params.push(category);
        }

        query += ' ORDER BY s.created_at DESC';

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

export const getService = async (req, res, next) => {
    try {
        const salonId = req.publicSalonId;
        const result = await pool.query(
            `SELECT s.*, sc.name as category_name 
       FROM services s
       LEFT JOIN service_categories sc ON s.category_id = sc.id
       WHERE s.id = $1 AND s.salon_id = $2`,
            [req.params.id, salonId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Service not found'
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

export const createService = async (req, res, next) => {
    try {
        const salonId = req.effectiveSalonId;
        const { category_id, name, description, price, duration, is_featured } = req.body;

        const cat = await pool.query(
            'SELECT id FROM service_categories WHERE id = $1 AND salon_id = $2',
            [category_id, salonId]
        );
        if (cat.rows.length === 0) {
            return res.status(400).json({ success: false, error: 'Invalid category for this salon' });
        }

        const image_url = req.file ? `/uploads/${req.file.filename}` : null;

        const result = await pool.query(
            `INSERT INTO services (salon_id, category_id, name, description, price, duration, image_url, is_featured)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
            [salonId, category_id, name, description, price, duration, image_url, is_featured || false]
        );

        res.status(201).json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        next(error);
    }
};

export const updateService = async (req, res, next) => {
    try {
        const salonId = req.effectiveSalonId;
        const { category_id, name, description, price, duration, is_featured, is_active } = req.body;

        const cat = await pool.query(
            'SELECT id FROM service_categories WHERE id = $1 AND salon_id = $2',
            [category_id, salonId]
        );
        if (cat.rows.length === 0) {
            return res.status(400).json({ success: false, error: 'Invalid category for this salon' });
        }

        let image_url = req.body.image_url;
        if (req.file) {
            image_url = `/uploads/${req.file.filename}`;
        }

        const result = await pool.query(
            `UPDATE services 
       SET category_id = $1, name = $2, description = $3, price = $4, 
           duration = $5, image_url = $6, is_featured = $7, is_active = $8, 
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $9 AND salon_id = $10
       RETURNING *`,
            [category_id, name, description, price, duration, image_url, is_featured, is_active, req.params.id, salonId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Service not found'
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

export const deleteService = async (req, res, next) => {
    try {
        const salonId = req.effectiveSalonId;
        const result = await pool.query(
            'DELETE FROM services WHERE id = $1 AND salon_id = $2 RETURNING *',
            [req.params.id, salonId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Service not found'
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

export const getCategories = async (req, res, next) => {
    try {
        const salonId = req.publicSalonId;
        const result = await pool.query(
            'SELECT * FROM service_categories WHERE is_active = true AND salon_id = $1 ORDER BY display_order',
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

export const createCategory = async (req, res, next) => {
    try {
        const salonId = req.effectiveSalonId;
        const { name, description, display_order } = req.body;

        const result = await pool.query(
            `INSERT INTO service_categories (salon_id, name, description, display_order)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
            [salonId, name, description, display_order || 0]
        );

        res.status(201).json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        next(error);
    }
};

export const updateCategory = async (req, res, next) => {
    try {
        const salonId = req.effectiveSalonId;
        const { name, description, display_order, is_active } = req.body;

        const result = await pool.query(
            `UPDATE service_categories 
       SET name = $1, description = $2, display_order = $3, is_active = $4, 
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5 AND salon_id = $6
       RETURNING *`,
            [name, description, display_order, is_active, req.params.id, salonId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Category not found'
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

export const deleteCategory = async (req, res, next) => {
    try {
        const salonId = req.effectiveSalonId;
        const result = await pool.query(
            'DELETE FROM service_categories WHERE id = $1 AND salon_id = $2 RETURNING *',
            [req.params.id, salonId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Category not found'
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
