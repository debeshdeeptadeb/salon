import pool from '../config/database.js';

export const getSettings = async (req, res, next) => {
    try {
        const salonId = req.publicSalonId;
        const result = await pool.query('SELECT * FROM site_settings WHERE salon_id = $1', [salonId]);

        if (result.rows.length === 0) {
            return res.status(200).json({
                success: true,
                data: {
                    navbar_logo_url: '/uploads/logo/minjal-salon-logo.svg',
                    footer_logo_url: '/uploads/logo/minjal-salon-logo.svg',
                    site_name: 'MINJAL',
                    site_tagline: 'Luxury Salon'
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

export const updateSettings = async (req, res, next) => {
    try {
        const salonId = req.effectiveSalonId;
        const { site_name, site_tagline, navbar_logo_url, footer_logo_url, upi_id } = req.body;

        const checkResult = await pool.query('SELECT id FROM site_settings WHERE salon_id = $1', [salonId]);

        let result;
        if (checkResult.rows.length === 0) {
            result = await pool.query(
                `INSERT INTO site_settings (salon_id, site_name, site_tagline, navbar_logo_url, footer_logo_url, upi_id, updated_at)
                 VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
                 RETURNING *`,
                [salonId, site_name, site_tagline, navbar_logo_url, footer_logo_url, upi_id || null]
            );
        } else {
            result = await pool.query(
                `UPDATE site_settings 
                 SET site_name = $1, 
                     site_tagline = $2, 
                     navbar_logo_url = $3, 
                     footer_logo_url = $4,
                     upi_id = $5,
                     updated_at = CURRENT_TIMESTAMP
                 WHERE salon_id = $6
                 RETURNING *`,
                [site_name, site_tagline, navbar_logo_url, footer_logo_url, upi_id || null, salonId]
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

export const uploadLogo = async (req, res, next) => {
    try {
        const salonId = req.effectiveSalonId;
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a logo file'
            });
        }

        const { logoType } = req.body;
        const logoUrl = `/uploads/${req.file.filename}`;

        const checkResult = await pool.query('SELECT id FROM site_settings WHERE salon_id = $1', [salonId]);

        let result;
        if (checkResult.rows.length === 0) {
            const field = logoType === 'navbar' ? 'navbar_logo_url' : 'footer_logo_url';
            result = await pool.query(
                `INSERT INTO site_settings (salon_id, ${field}, updated_at)
                 VALUES ($1, $2, CURRENT_TIMESTAMP)
                 RETURNING *`,
                [salonId, logoUrl]
            );
        } else {
            const field = logoType === 'navbar' ? 'navbar_logo_url' : 'footer_logo_url';
            result = await pool.query(
                `UPDATE site_settings 
                 SET ${field} = $1, updated_at = CURRENT_TIMESTAMP
                 WHERE salon_id = $2
                 RETURNING *`,
                [logoUrl, salonId]
            );
        }

        res.status(200).json({
            success: true,
            data: {
                logoUrl,
                settings: result.rows[0]
            }
        });
    } catch (error) {
        next(error);
    }
};

export const uploadUpiQR = async (req, res, next) => {
    try {
        const salonId = req.effectiveSalonId;
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a UPI QR code image'
            });
        }

        const upiQrUrl = `/uploads/${req.file.filename}`;

        const checkResult = await pool.query('SELECT id FROM site_settings WHERE salon_id = $1', [salonId]);

        let result;
        if (checkResult.rows.length === 0) {
            result = await pool.query(
                `INSERT INTO site_settings (salon_id, upi_qr_image_url, updated_at)
                 VALUES ($1, $2, CURRENT_TIMESTAMP)
                 RETURNING *`,
                [salonId, upiQrUrl]
            );
        } else {
            result = await pool.query(
                `UPDATE site_settings 
                 SET upi_qr_image_url = $1, updated_at = CURRENT_TIMESTAMP
                 WHERE salon_id = $2
                 RETURNING *`,
                [upiQrUrl, salonId]
            );
        }

        res.status(200).json({
            success: true,
            data: {
                upiQrUrl,
                settings: result.rows[0]
            }
        });
    } catch (error) {
        next(error);
    }
};
