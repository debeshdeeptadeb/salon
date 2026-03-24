import pool from '../config/database.js';

export const getAboutContent = async (req, res, next) => {
    try {
        const salonId = req.publicSalonId;
        const result = await pool.query(
            `SELECT * FROM content_pages 
       WHERE salon_id = $1 AND page_key IN ('about', 'brand_story', 'philosophy', 'owner')`,
            [salonId]
        );

        const content = {};
        result.rows.forEach(row => {
            content[row.page_key] = {
                title: row.title,
                content: row.content,
                updated_at: row.updated_at
            };
        });

        res.status(200).json({
            success: true,
            data: content
        });
    } catch (error) {
        next(error);
    }
};

export const updateAboutContent = async (req, res, next) => {
    try {
        const salonId = req.effectiveSalonId;
        const { about, brand_story, philosophy, owner } = req.body;

        const updates = [
            { key: 'about', data: about },
            { key: 'brand_story', data: brand_story },
            { key: 'philosophy', data: philosophy },
            { key: 'owner', data: owner }
        ];

        for (const update of updates) {
            if (update.data) {
                await pool.query(
                    `INSERT INTO content_pages (salon_id, page_key, title, content, updated_at)
           VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
           ON CONFLICT (salon_id, page_key) 
           DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, updated_at = CURRENT_TIMESTAMP`,
                    [salonId, update.key, update.data.title, update.data.content]
                );
            }
        }

        const result = await pool.query(
            `SELECT * FROM content_pages 
       WHERE salon_id = $1 AND page_key IN ('about', 'brand_story', 'philosophy', 'owner')`,
            [salonId]
        );

        const content = {};
        result.rows.forEach(row => {
            content[row.page_key] = {
                title: row.title,
                content: row.content,
                updated_at: row.updated_at
            };
        });

        res.status(200).json({
            success: true,
            data: content
        });
    } catch (error) {
        next(error);
    }
};
