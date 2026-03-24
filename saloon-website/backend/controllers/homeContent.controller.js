import pool from '../config/database.js';

export const getHeroContent = async (req, res, next) => {
    try {
        const salonId = req.publicSalonId;
        const result = await pool.query('SELECT * FROM home_hero WHERE salon_id = $1', [salonId]);

        if (result.rows.length === 0) {
            return res.status(200).json({
                success: true,
                data: {
                    badge_text: 'Bhubaneswar\'s Premier Luxury Salon',
                    title_main: 'Where Elegance Meets Expert Care',
                    title_highlight: 'Elegance',
                    subtitle: 'Experience world-class beauty and grooming services in an atmosphere of refined luxury. Your transformation begins here.',
                    stat_years: 10,
                    stat_clients: 5000,
                    stat_services: 50
                }
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

export const updateHeroContent = async (req, res, next) => {
    try {
        const salonId = req.effectiveSalonId;
        const { badge_text, title_main, title_highlight, subtitle, stat_years, stat_clients, stat_services } = req.body;

        const checkResult = await pool.query('SELECT id FROM home_hero WHERE salon_id = $1', [salonId]);

        let result;
        if (checkResult.rows.length === 0) {
            result = await pool.query(
                `INSERT INTO home_hero (salon_id, badge_text, title_main, title_highlight, subtitle, stat_years, stat_clients, stat_services, updated_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
                 RETURNING *`,
                [salonId, badge_text, title_main, title_highlight, subtitle, stat_years, stat_clients, stat_services]
            );
        } else {
            result = await pool.query(
                `UPDATE home_hero 
                 SET badge_text = $1, 
                     title_main = $2, 
                     title_highlight = $3, 
                     subtitle = $4,
                     stat_years = $5,
                     stat_clients = $6,
                     stat_services = $7,
                     updated_at = CURRENT_TIMESTAMP
                 WHERE salon_id = $8
                 RETURNING *`,
                [badge_text, title_main, title_highlight, subtitle, stat_years, stat_clients, stat_services, salonId]
            );
        }

        res.status(200).json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        next(error);
    }
};

export const getServicesPreview = async (req, res, next) => {
    try {
        const salonId = req.publicSalonId;
        const result = await pool.query(
            'SELECT * FROM home_services WHERE is_active = true AND salon_id = $1 ORDER BY display_order ASC',
            [salonId]
        );

        res.status(200).json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        next(error);
    }
};

export const updateServicesPreview = async (req, res, next) => {
    try {
        const salonId = req.effectiveSalonId;
        const { services } = req.body;

        if (!Array.isArray(services)) {
            return res.status(400).json({
                success: false,
                message: 'Services must be an array'
            });
        }

        await pool.query('DELETE FROM home_services WHERE salon_id = $1', [salonId]);

        for (const service of services) {
            await pool.query(
                `INSERT INTO home_services (salon_id, title, description, icon, image_url, display_order, is_active, updated_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)`,
                [salonId, service.title, service.description, service.icon, service.image_url, service.display_order, service.is_active]
            );
        }

        const result = await pool.query(
            'SELECT * FROM home_services WHERE is_active = true AND salon_id = $1 ORDER BY display_order ASC',
            [salonId]
        );

        res.status(200).json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        next(error);
    }
};

export const uploadServiceImage = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload an image file'
            });
        }

        const imageUrl = `/uploads/${req.file.filename}`;

        res.status(200).json({
            success: true,
            data: { imageUrl }
        });
    } catch (error) {
        next(error);
    }
};

export const getPrices = async (req, res, next) => {
    try {
        const salonId = req.publicSalonId;
        const result = await pool.query(
            'SELECT * FROM home_prices WHERE is_active = true AND salon_id = $1 ORDER BY display_order ASC',
            [salonId]
        );

        res.status(200).json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        next(error);
    }
};

export const updatePrices = async (req, res, next) => {
    try {
        const salonId = req.effectiveSalonId;
        const { prices } = req.body;

        if (!Array.isArray(prices)) {
            return res.status(400).json({
                success: false,
                message: 'Prices must be an array'
            });
        }

        await pool.query('DELETE FROM home_prices WHERE salon_id = $1', [salonId]);

        for (const price of prices) {
            await pool.query(
                `INSERT INTO home_prices (salon_id, service_name, price, display_order, is_active, updated_at)
                 VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)`,
                [salonId, price.service_name, price.price, price.display_order, price.is_active]
            );
        }

        const result = await pool.query(
            'SELECT * FROM home_prices WHERE is_active = true AND salon_id = $1 ORDER BY display_order ASC',
            [salonId]
        );

        res.status(200).json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        next(error);
    }
};
