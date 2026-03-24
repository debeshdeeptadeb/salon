import pool from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const getGalleryImages = async (req, res, next) => {
    try {
        const salonId = req.publicSalonId;
        const result = await pool.query(
            'SELECT * FROM gallery_images WHERE is_active = true AND salon_id = $1 ORDER BY display_order, created_at DESC',
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

export const uploadGalleryImage = async (req, res, next) => {
    try {
        const salonId = req.effectiveSalonId;
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'Please upload an image'
            });
        }

        const { caption, display_order } = req.body;
        const image_url = `/uploads/${req.file.filename}`;

        const result = await pool.query(
            `INSERT INTO gallery_images (salon_id, image_url, caption, display_order)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
            [salonId, image_url, caption || null, display_order || 0]
        );

        res.status(201).json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        next(error);
    }
};

export const deleteGalleryImage = async (req, res, next) => {
    try {
        const salonId = req.effectiveSalonId;
        const result = await pool.query(
            'DELETE FROM gallery_images WHERE id = $1 AND salon_id = $2 RETURNING *',
            [req.params.id, salonId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Gallery image not found'
            });
        }

        const image = result.rows[0];
        if (image.image_url) {
            const filePath = path.join(__dirname, '..', image.image_url);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        next(error);
    }
};

export const updateGalleryImage = async (req, res, next) => {
    try {
        const salonId = req.effectiveSalonId;
        const { caption, display_order, is_active } = req.body;

        const result = await pool.query(
            `UPDATE gallery_images 
       SET caption = $1, display_order = $2, is_active = $3
       WHERE id = $4 AND salon_id = $5
       RETURNING *`,
            [caption, display_order, is_active, req.params.id, salonId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Gallery image not found'
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
