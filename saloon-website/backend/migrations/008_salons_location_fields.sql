-- =============================================
-- Add location fields to salons for discovery search
-- =============================================

ALTER TABLE salons ADD COLUMN IF NOT EXISTS area VARCHAR(255);
ALTER TABLE salons ADD COLUMN IF NOT EXISTS city VARCHAR(120);
ALTER TABLE salons ADD COLUMN IF NOT EXISTS state VARCHAR(120);
ALTER TABLE salons ADD COLUMN IF NOT EXISTS pincode VARCHAR(20);
ALTER TABLE salons ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE salons ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

CREATE INDEX IF NOT EXISTS idx_salons_city ON salons(city);
CREATE INDEX IF NOT EXISTS idx_salons_area ON salons(area);
CREATE INDEX IF NOT EXISTS idx_salons_state ON salons(state);
CREATE INDEX IF NOT EXISTS idx_salons_pincode ON salons(pincode);

SELECT '008 salons location migration completed' AS message;
