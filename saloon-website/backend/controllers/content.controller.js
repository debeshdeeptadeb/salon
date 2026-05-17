import pool from '../config/database.js';

const ABOUT_KEYS = ['about', 'brand_story', 'philosophy', 'owner'];

export const getAboutContent = async (req, res, next) => {
    try {
        const result = await pool.query(
            `SELECT page_key, title, content, updated_at
             FROM platform_content_pages
             WHERE page_key = ANY($1::text[])`,
            [ABOUT_KEYS]
        );

        const content = {};
        result.rows.forEach((row) => {
            content[row.page_key] = {
                title: row.title,
                content: row.content,
                updated_at: row.updated_at,
            };
        });

        res.status(200).json({
            success: true,
            data: content,
        });
    } catch (error) {
        if (error?.code === '42P01') {
            return res.status(500).json({
                success: false,
                error:
                    'About content is not available until migration 011 (platform_content_pages) is applied on the database.',
            });
        }
        next(error);
    }
};

export const updateAboutContent = async (req, res, next) => {
    try {
        const { about, brand_story, philosophy, owner } = req.body;

        const updates = [
            { key: 'about', data: about },
            { key: 'brand_story', data: brand_story },
            { key: 'philosophy', data: philosophy },
            { key: 'owner', data: owner },
        ];

        for (const update of updates) {
            if (update.data) {
                await pool.query(
                    `INSERT INTO platform_content_pages (page_key, title, content, updated_at)
                     VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
                     ON CONFLICT (page_key)
                     DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, updated_at = CURRENT_TIMESTAMP`,
                    [update.key, update.data.title, update.data.content]
                );
            }
        }

        const result = await pool.query(
            `SELECT page_key, title, content, updated_at
             FROM platform_content_pages
             WHERE page_key = ANY($1::text[])`,
            [ABOUT_KEYS]
        );

        const content = {};
        result.rows.forEach((row) => {
            content[row.page_key] = {
                title: row.title,
                content: row.content,
                updated_at: row.updated_at,
            };
        });

        res.status(200).json({
            success: true,
            data: content,
        });
    } catch (error) {
        next(error);
    }
};
