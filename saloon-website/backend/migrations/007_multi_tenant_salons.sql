-- =============================================
-- MULTI-TENANT: salons + salon_id on tenant tables
-- Run after existing migrations. Backfills to default salon.
-- =============================================

-- 1) Salons
CREATE TABLE IF NOT EXISTS salons (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO salons (name, slug)
SELECT 'Default Salon', 'default'
WHERE NOT EXISTS (SELECT 1 FROM salons LIMIT 1);

-- 2) Admins: link to salon; super_admin has NULL salon_id
ALTER TABLE admins ADD COLUMN IF NOT EXISTS salon_id INTEGER REFERENCES salons(id) ON DELETE SET NULL;

UPDATE admins SET salon_id = (SELECT id FROM salons WHERE slug = 'default' LIMIT 1)
WHERE salon_id IS NULL AND (role IS NULL OR role = 'admin' OR role = 'salon_admin');

UPDATE admins SET role = 'salon_admin' WHERE role = 'admin';

-- Optional: promote platform owner manually:
-- UPDATE admins SET role = 'super_admin', salon_id = NULL WHERE email = 'owner@example.com';

-- 3) service_categories — unique name per salon
ALTER TABLE service_categories ADD COLUMN IF NOT EXISTS salon_id INTEGER REFERENCES salons(id) ON DELETE CASCADE;
UPDATE service_categories SET salon_id = (SELECT id FROM salons WHERE slug = 'default' LIMIT 1) WHERE salon_id IS NULL;
ALTER TABLE service_categories ALTER COLUMN salon_id SET NOT NULL;

ALTER TABLE service_categories DROP CONSTRAINT IF EXISTS service_categories_name_key;
ALTER TABLE service_categories ADD CONSTRAINT service_categories_salon_name_unique UNIQUE (salon_id, name);

-- 4) services
ALTER TABLE services ADD COLUMN IF NOT EXISTS salon_id INTEGER REFERENCES salons(id) ON DELETE CASCADE;
UPDATE services SET salon_id = (SELECT id FROM salons WHERE slug = 'default' LIMIT 1) WHERE salon_id IS NULL;
ALTER TABLE services ALTER COLUMN salon_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_services_salon ON services(salon_id);

-- 5) catalogue_items
ALTER TABLE catalogue_items ADD COLUMN IF NOT EXISTS salon_id INTEGER REFERENCES salons(id) ON DELETE CASCADE;
UPDATE catalogue_items SET salon_id = (SELECT id FROM salons WHERE slug = 'default' LIMIT 1) WHERE salon_id IS NULL;
ALTER TABLE catalogue_items ALTER COLUMN salon_id SET NOT NULL;

-- 6) gallery_images
ALTER TABLE gallery_images ADD COLUMN IF NOT EXISTS salon_id INTEGER REFERENCES salons(id) ON DELETE CASCADE;
UPDATE gallery_images SET salon_id = (SELECT id FROM salons WHERE slug = 'default' LIMIT 1) WHERE salon_id IS NULL;
ALTER TABLE gallery_images ALTER COLUMN salon_id SET NOT NULL;

-- 7) offers
ALTER TABLE offers ADD COLUMN IF NOT EXISTS salon_id INTEGER REFERENCES salons(id) ON DELETE CASCADE;
UPDATE offers SET salon_id = (SELECT id FROM salons WHERE slug = 'default' LIMIT 1) WHERE salon_id IS NULL;
ALTER TABLE offers ALTER COLUMN salon_id SET NOT NULL;

-- 8) content_pages — unique page_key per salon
ALTER TABLE content_pages ADD COLUMN IF NOT EXISTS salon_id INTEGER REFERENCES salons(id) ON DELETE CASCADE;
UPDATE content_pages SET salon_id = (SELECT id FROM salons WHERE slug = 'default' LIMIT 1) WHERE salon_id IS NULL;
ALTER TABLE content_pages ALTER COLUMN salon_id SET NOT NULL;
ALTER TABLE content_pages DROP CONSTRAINT IF EXISTS content_pages_page_key_key;
ALTER TABLE content_pages ADD CONSTRAINT content_pages_salon_page_unique UNIQUE (salon_id, page_key);

-- 9) enquiries
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS salon_id INTEGER REFERENCES salons(id) ON DELETE CASCADE;
UPDATE enquiries SET salon_id = (SELECT id FROM salons WHERE slug = 'default' LIMIT 1) WHERE salon_id IS NULL;
ALTER TABLE enquiries ALTER COLUMN salon_id SET NOT NULL;

-- 10) bookings
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS salon_id INTEGER REFERENCES salons(id) ON DELETE CASCADE;
UPDATE bookings SET salon_id = (SELECT id FROM salons WHERE slug = 'default' LIMIT 1) WHERE salon_id IS NULL;
ALTER TABLE bookings ALTER COLUMN salon_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bookings_salon ON bookings(salon_id);

-- 11) site_settings — one row per salon
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS salon_id INTEGER REFERENCES salons(id) ON DELETE CASCADE;
UPDATE site_settings SET salon_id = (SELECT id FROM salons WHERE slug = 'default' LIMIT 1) WHERE salon_id IS NULL;
DELETE FROM site_settings a USING site_settings b WHERE a.salon_id = b.salon_id AND a.id > b.id;
ALTER TABLE site_settings ALTER COLUMN salon_id SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_site_settings_salon_unique ON site_settings(salon_id);

-- 12) home_hero
ALTER TABLE home_hero ADD COLUMN IF NOT EXISTS salon_id INTEGER REFERENCES salons(id) ON DELETE CASCADE;
UPDATE home_hero SET salon_id = (SELECT id FROM salons WHERE slug = 'default' LIMIT 1) WHERE salon_id IS NULL;
DELETE FROM home_hero a USING home_hero b WHERE a.salon_id = b.salon_id AND a.id > b.id;
ALTER TABLE home_hero ALTER COLUMN salon_id SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_home_hero_salon_unique ON home_hero(salon_id);

-- 13) home_services
ALTER TABLE home_services ADD COLUMN IF NOT EXISTS salon_id INTEGER REFERENCES salons(id) ON DELETE CASCADE;
UPDATE home_services SET salon_id = (SELECT id FROM salons WHERE slug = 'default' LIMIT 1) WHERE salon_id IS NULL;
ALTER TABLE home_services ALTER COLUMN salon_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_home_services_salon ON home_services(salon_id);

-- 14) home_prices
ALTER TABLE home_prices ADD COLUMN IF NOT EXISTS salon_id INTEGER REFERENCES salons(id) ON DELETE CASCADE;
UPDATE home_prices SET salon_id = (SELECT id FROM salons WHERE slug = 'default' LIMIT 1) WHERE salon_id IS NULL;
ALTER TABLE home_prices ALTER COLUMN salon_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_home_prices_salon ON home_prices(salon_id);

-- 15) salon_qr_codes
ALTER TABLE salon_qr_codes ADD COLUMN IF NOT EXISTS salon_id INTEGER REFERENCES salons(id) ON DELETE CASCADE;
UPDATE salon_qr_codes SET salon_id = (SELECT id FROM salons WHERE slug = 'default' LIMIT 1) WHERE salon_id IS NULL;
ALTER TABLE salon_qr_codes ALTER COLUMN salon_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_salon_qr_codes_salon ON salon_qr_codes(salon_id);

SELECT '007 multi-tenant migration completed' AS message;
