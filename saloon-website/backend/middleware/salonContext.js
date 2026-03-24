import pool from '../config/database.js';

/**
 * Resolves salon id from ?salon=slug (default: default). Sets req.publicSalonId.
 * Use on public routes that need tenant scope.
 */
export const publicSalonFromQuery = async (req, res, next) => {
    try {
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
