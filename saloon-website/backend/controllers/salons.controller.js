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

    // Clone service categories + services from default salon so search/booking works immediately.
    const defaultSalonRes = await client.query(
        `SELECT id FROM salons WHERE slug = 'default' LIMIT 1`
    );
    if (defaultSalonRes.rows.length === 0) return;

    const defaultSalonId = defaultSalonRes.rows[0].id;
    if (Number(defaultSalonId) === Number(salonId)) return;

    const categories = await client.query(
        `SELECT id, name, description, display_order, is_active
         FROM service_categories
         WHERE salon_id = $1
         ORDER BY display_order ASC, id ASC`,
        [defaultSalonId]
    );

    const categoryMap = new Map();
    for (const c of categories.rows) {
        const inserted = await client.query(
            `INSERT INTO service_categories (salon_id, name, description, display_order, is_active)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id`,
            [salonId, c.name, c.description, c.display_order, c.is_active]
        );
        categoryMap.set(c.id, inserted.rows[0].id);
    }

    const services = await client.query(
        `SELECT category_id, name, description, price, duration, image_url, is_active, is_featured
         FROM services
         WHERE salon_id = $1
         ORDER BY id ASC`,
        [defaultSalonId]
    );

    for (const s of services.rows) {
        const newCategoryId = categoryMap.get(s.category_id);
        if (!newCategoryId) continue;
        await client.query(
            `INSERT INTO services (salon_id, category_id, name, description, price, duration, image_url, is_active, is_featured)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
                salonId,
                newCategoryId,
                s.name,
                s.description,
                s.price,
                s.duration,
                s.image_url,
                s.is_active,
                s.is_featured,
            ]
        );
    }
}

// @desc    List salons (platform owner)
// @route   GET /api/salons
export const listSalons = async (req, res, next) => {
    try {
        const result = await pool.query(
            `SELECT id, name, slug, area, city, state, pincode, latitude, longitude, is_active, created_at
             FROM salons
             ORDER BY name ASC`
        );
        res.status(200).json({ success: true, data: result.rows });
    } catch (e) {
        next(e);
    }
};

// @desc    Public discovery: search salons by name/service/location
// @route   GET /api/salons/discover
export const discoverSalons = async (req, res, next) => {
    try {
        const q = (req.query.q || '').trim();
        const location = (req.query.location || '').trim();
        const lat = parseFloat(req.query.lat);
        const lng = parseFloat(req.query.lng);
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 50);

        const qLike = `%${q}%`;
        const locLike = `%${location}%`;

        const result = await pool.query(
            `
            WITH matched AS (
              SELECT
                s.id,
                s.name,
                s.slug,
                s.area,
                s.city,
                s.state,
                s.pincode,
                s.latitude,
                s.longitude,
                sv.id AS service_id,
                sv.name AS service_name,
                sv.price AS service_price,
                sv.duration AS service_duration,
                (
                  6371 * acos(
                    LEAST(
                      1,
                      GREATEST(
                        -1,
                        cos(radians($3)) * cos(radians(COALESCE(s.latitude, $3))) *
                        cos(radians(COALESCE(s.longitude, $4)) - radians($4)) +
                        sin(radians($3)) * sin(radians(COALESCE(s.latitude, $3)))
                      )
                    )
                  )
                ) AS distance_km
              FROM salons s
              LEFT JOIN services sv ON sv.salon_id = s.id AND sv.is_active = true
              LEFT JOIN service_categories sc ON sc.id = sv.category_id
              WHERE s.is_active = true
                AND (
                  $1 = '' OR
                  s.name ILIKE $5 OR
                  sv.name ILIKE $5 OR
                  sc.name ILIKE $5
                )
                AND (
                  $2 = '' OR
                  COALESCE(s.area, '') ILIKE $6 OR
                  COALESCE(s.city, '') ILIKE $6 OR
                  COALESCE(s.state, '') ILIKE $6 OR
                  COALESCE(s.pincode, '') ILIKE $6
                )
            )
            SELECT
              id, name, slug, area, city, state, pincode, latitude, longitude,
              CASE
                WHEN $3 IS NULL OR $4 IS NULL THEN NULL
                ELSE MIN(distance_km)
              END AS distance_km,
              COALESCE(
                json_agg(
                  DISTINCT jsonb_build_object(
                    'id', service_id,
                    'name', service_name,
                    'price', service_price,
                    'duration', service_duration
                  )
                ) FILTER (WHERE service_id IS NOT NULL),
                '[]'::json
              ) AS matched_services
            FROM matched
            GROUP BY id, name, slug, area, city, state, pincode, latitude, longitude
            ORDER BY
              CASE WHEN $3 IS NULL OR $4 IS NULL THEN 0 ELSE 1 END DESC,
              CASE WHEN $3 IS NULL OR $4 IS NULL THEN name END ASC,
              CASE WHEN $3 IS NOT NULL AND $4 IS NOT NULL THEN MIN(distance_km) END ASC NULLS LAST
            LIMIT $7
            `,
            [q, location, Number.isFinite(lat) ? lat : null, Number.isFinite(lng) ? lng : null, qLike, locLike, limit]
        );

        res.status(200).json({
            success: true,
            count: result.rows.length,
            data: result.rows,
        });
    } catch (e) {
        next(e);
    }
};

// @desc    Create salon + empty tenant data
// @route   POST /api/salons
export const createSalon = async (req, res, next) => {
    try {
        const {
            name,
            slug: slugIn,
            area,
            city,
            state,
            pincode,
            latitude,
            longitude,
        } = req.body;
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
                `INSERT INTO salons (name, slug, area, city, state, pincode, latitude, longitude)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                 RETURNING *`,
                [
                    name.trim(),
                    slug,
                    area?.trim() || null,
                    city?.trim() || null,
                    state?.trim() || null,
                    pincode?.trim() || null,
                    latitude ? Number(latitude) : null,
                    longitude ? Number(longitude) : null,
                ]
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
            `SELECT id, name, slug, area, city, state, pincode, latitude, longitude
             FROM salons
             WHERE slug = $1 AND is_active = true`,
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
