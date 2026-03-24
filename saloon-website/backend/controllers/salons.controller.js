import pool from '../config/database.js';

function slugify(name) {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'salon';
}

async function seedNewSalonContent(client, salonId, displayName) {
    await client.query(
        `INSERT INTO site_settings (salon_id, navbar_logo_url, footer_logo_url, site_name, site_tagline)
         VALUES ($1, '/uploads/logo/minjal-salon-logo.svg', '/uploads/logo/minjal-salon-logo.svg', $2, 'Luxury Salon')`,
        [salonId, displayName]
    );
    await client.query(
        `INSERT INTO home_hero (salon_id, badge_text, title_main, title_highlight, subtitle, stat_years, stat_clients, stat_services)
         VALUES ($1, 'Premium salon', 'Welcome', 'Care', 'Your beauty journey starts here.', 10, 1000, 50)`,
        [salonId]
    );
}

// @desc    List salons (platform owner)
// @route   GET /api/salons
export const listSalons = async (req, res, next) => {
    try {
        const result = await pool.query(
            'SELECT id, name, slug, is_active, created_at FROM salons ORDER BY name ASC'
        );
        res.status(200).json({ success: true, data: result.rows });
    } catch (e) {
        next(e);
    }
};

// @desc    Create salon + empty tenant data
// @route   POST /api/salons
export const createSalon = async (req, res, next) => {
    try {
        const { name, slug: slugIn } = req.body;
        if (!name?.trim()) {
            return res.status(400).json({ success: false, error: 'Name is required' });
        }
        let slug = slugIn?.trim() ? slugify(slugIn) : slugify(name);
        const dup = await pool.query('SELECT id FROM salons WHERE slug = $1', [slug]);
        if (dup.rows.length > 0) {
            slug = `${slug}-${Date.now().toString(36)}`;
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const ins = await client.query(
                'INSERT INTO salons (name, slug) VALUES ($1, $2) RETURNING *',
                [name.trim(), slug]
            );
            const salon = ins.rows[0];
            await seedNewSalonContent(client, salon.id, name.trim());
            await client.query('COMMIT');
            res.status(201).json({ success: true, data: salon });
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    } catch (e) {
        next(e);
    }
};

// @desc    Public: resolve salon by slug
// @route   GET /api/salons/public/:slug
export const getPublicSalon = async (req, res, next) => {
    try {
        const result = await pool.query(
            'SELECT id, name, slug FROM salons WHERE slug = $1 AND is_active = true',
            [req.params.slug]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Salon not found' });
        }
        res.status(200).json({ success: true, data: result.rows[0] });
    } catch (e) {
        next(e);
    }
};
