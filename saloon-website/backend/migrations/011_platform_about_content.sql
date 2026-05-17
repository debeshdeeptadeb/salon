-- Company / founder copy for the public About page (single source, not per-tenant).
-- Only super_admin may edit via PUT /api/content/about.

CREATE TABLE IF NOT EXISTS platform_content_pages (
    page_key VARCHAR(100) PRIMARY KEY,
    title TEXT NOT NULL DEFAULT '',
    content TEXT,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Copy existing default-salon about blocks into platform (once), if present.
INSERT INTO platform_content_pages (page_key, title, content, updated_at)
SELECT cp.page_key, COALESCE(cp.title, ''), cp.content, cp.updated_at
FROM content_pages cp
INNER JOIN salons s ON s.id = cp.salon_id AND s.slug = 'default'
WHERE cp.page_key IN ('about', 'brand_story', 'philosophy', 'owner')
ON CONFLICT (page_key) DO NOTHING;

-- Ensure all section keys exist.
INSERT INTO platform_content_pages (page_key, title, content) VALUES
    ('about', 'About Us', ''),
    ('brand_story', 'Our Story', ''),
    ('philosophy', 'Our Philosophy', ''),
    ('owner', 'Meet Our Founder', '')
ON CONFLICT (page_key) DO NOTHING;

SELECT '011 platform_about_content migration completed' AS message;
