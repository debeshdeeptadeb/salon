import pool from '../config/database.js';
import QRCode from 'qrcode';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const qrUploadDir = path.join(__dirname, '../uploads/qr');
if (!fs.existsSync(qrUploadDir)) {
    fs.mkdirSync(qrUploadDir, { recursive: true });
}

export const generateQRCode = async (req, res, next) => {
    try {
        const salonId = req.effectiveSalonId;
        const { label } = req.body;

        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 8);
        const qrCodeId = `qr_${timestamp}_${randomStr}`;

        const frontendUrl = process.env.FRONTEND_URL?.split(',')[0] || 'http://localhost:5173';
        const qrUrl = `${frontendUrl}/salon/${qrCodeId}`;

        const qrImageFilename = `${qrCodeId}.png`;
        const qrImagePath = path.join(qrUploadDir, qrImageFilename);
        const qrImageUrl = `/uploads/qr/${qrImageFilename}`;

        await QRCode.toFile(qrImagePath, qrUrl, {
            width: 500,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });

        const result = await pool.query(
            `INSERT INTO salon_qr_codes (salon_id, qr_code_id, qr_image_url, label, is_active)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [salonId, qrCodeId, qrImageUrl, label || null, true]
        );

        res.status(201).json({
            success: true,
            data: result.rows[0],
            qrUrl: qrUrl
        });
    } catch (error) {
        next(error);
    }
};

export const getQRCodes = async (req, res, next) => {
    try {
        const salonId = req.effectiveSalonId;
        const result = await pool.query(
            'SELECT * FROM salon_qr_codes WHERE salon_id = $1 ORDER BY created_at DESC',
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

export const getQRCodeById = async (req, res, next) => {
    try {
        const salonId = req.effectiveSalonId;
        const result = await pool.query(
            'SELECT * FROM salon_qr_codes WHERE id = $1 AND salon_id = $2',
            [req.params.id, salonId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'QR code not found'
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

export const deleteQRCode = async (req, res, next) => {
    try {
        const salonId = req.effectiveSalonId;
        const qrResult = await pool.query(
            'SELECT * FROM salon_qr_codes WHERE id = $1 AND salon_id = $2',
            [req.params.id, salonId]
        );

        if (qrResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'QR code not found'
            });
        }

        const qrCode = qrResult.rows[0];

        if (qrCode.qr_image_url) {
            const imagePath = path.join(__dirname, '..', qrCode.qr_image_url);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await pool.query(
            'DELETE FROM salon_qr_codes WHERE id = $1 AND salon_id = $2',
            [req.params.id, salonId]
        );

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        next(error);
    }
};

export const toggleQRCodeStatus = async (req, res, next) => {
    try {
        const salonId = req.effectiveSalonId;
        const result = await pool.query(
            `UPDATE salon_qr_codes 
             SET is_active = NOT is_active, updated_at = CURRENT_TIMESTAMP
             WHERE id = $1 AND salon_id = $2
             RETURNING *`,
            [req.params.id, salonId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'QR code not found'
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

export const getServicesByQRCode = async (req, res, next) => {
    try {
        const { qrCodeId } = req.params;

        const qrResult = await pool.query(
            `SELECT q.*, s.slug AS salon_slug, s.name AS salon_display_name
             FROM salon_qr_codes q
             INNER JOIN salons s ON q.salon_id = s.id
             WHERE q.qr_code_id = $1 AND q.is_active = true`,
            [qrCodeId]
        );

        if (qrResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'QR code not found or inactive'
            });
        }

        const qrRow = qrResult.rows[0];
        const salonId = qrRow.salon_id;

        const servicesResult = await pool.query(
            `SELECT s.*, sc.name as category_name 
             FROM services s
             LEFT JOIN service_categories sc ON s.category_id = sc.id
             WHERE s.is_active = true AND s.salon_id = $1
             ORDER BY sc.display_order, s.created_at DESC`,
            [salonId]
        );

        const settingsResult = await pool.query(
            'SELECT * FROM site_settings WHERE salon_id = $1',
            [salonId]
        );

        const salonInfo = settingsResult.rows.length > 0 ? {
            name: settingsResult.rows[0].site_name || 'MINJAL',
            tagline: settingsResult.rows[0].site_tagline || 'Luxury Salon',
            logo: settingsResult.rows[0].navbar_logo_url || '/uploads/logo/minjal-salon-logo.svg',
            slug: qrRow.salon_slug
        } : {
            name: qrRow.salon_display_name || 'MINJAL',
            tagline: 'Luxury Salon',
            logo: '/uploads/logo/minjal-salon-logo.svg',
            slug: qrRow.salon_slug
        };

        res.status(200).json({
            success: true,
            data: {
                qrCode: qrRow,
                salon: salonInfo,
                services: servicesResult.rows,
                count: servicesResult.rows.length
            }
        });
    } catch (error) {
        next(error);
    }
};
