import jwt from 'jsonwebtoken';
import pool from '../config/database.js';

/**
 * Resolves the salon id this request should read from.
 *
 * Priority:
 *   1. Authenticated admin:
 *      - salon_admin  → req.user.salon_id  (their assigned tenant)
 *      - super_admin  → X-Salon-Id header  (the tenant they switched to)
 *   2. Public (no token) → ?salon=slug (defaults to 'default')
 *
 * Sets req.publicSalonId (and req.publicSalonSlug for the slug-based path).
 */
export const publicSalonFromQuery = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer')) {
            const token = authHeader.split(' ')[1];
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const r = await pool.query(
                    `SELECT a.id, a.role, a.salon_id, s.slug AS salon_slug
                     FROM admins a
                     LEFT JOIN salons s ON s.id = a.salon_id
                     WHERE a.id = $1`,
                    [decoded.id]
                );
                if (r.rows.length) {
                    const admin = r.rows[0];
                    if (admin.role === 'salon_admin' && admin.salon_id) {
                        req.publicSalonId = admin.salon_id;
                        req.publicSalonSlug = admin.salon_slug || null;
                        return next();
                    }
                    if (admin.role === 'super_admin') {
                        const raw = req.headers['x-salon-id'];
                        if (raw) {
                            const id = parseInt(raw, 10);
                            if (Number.isFinite(id)) {
                                req.publicSalonId = id;
                                return next();
                            }
                        }
                    }
                }
            } catch {
                /* token invalid / expired — fall through to slug-based path */
            }
        }

        const slug = req.query.salon || req.body?.salon || 'default';
        const result = await pool.query(
            'SELECT id FROM salons WHERE slug = $1 AND is_active = true',
            [slug]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Salon not found',
            });
        }
        req.publicSalonId = result.rows[0].id;
        req.publicSalonSlug = slug;
        next();
    } catch (e) {
        next(e);
    }
};

/**
 * After protect: sets req.effectiveSalonId for salon_admin (always) or super_admin (requires X-Salon-Id).
 */
export const requireSalonContext = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ success: false, error: 'Not authorized' });
    }
    if (req.user.role === 'super_admin') {
        const raw = req.headers['x-salon-id'];
        if (!raw) {
            return res.status(400).json({
                success: false,
                error: 'Select a salon in the admin panel (salon switcher) to manage that tenant.',
            });
        }
        const id = parseInt(raw, 10);
        if (Number.isNaN(id)) {
            return res.status(400).json({ success: false, error: 'Invalid X-Salon-Id' });
        }
        req.effectiveSalonId = id;
    } else if (req.user.role === 'salon_admin') {
        if (!req.user.salon_id) {
            return res.status(403).json({ success: false, error: 'No salon assigned to this account' });
        }
        req.effectiveSalonId = req.user.salon_id;
    } else {
        return res.status(403).json({ success: false, error: 'Invalid role' });
    }
    next();
};

export const requireSuperAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'super_admin') {
        return res.status(403).json({ success: false, error: 'Platform owner access only' });
    }
    next();
};
