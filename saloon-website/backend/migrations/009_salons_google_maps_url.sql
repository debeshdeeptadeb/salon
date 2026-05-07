-- Google Maps link for directions (share link from Google Maps)
ALTER TABLE salons ADD COLUMN IF NOT EXISTS google_maps_url TEXT;

SELECT '009 salons google_maps_url migration completed' AS message;
