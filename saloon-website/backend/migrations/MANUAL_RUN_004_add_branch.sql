-- =============================================
-- MANUAL MIGRATION INSTRUCTIONS
-- =============================================
-- Run this SQL in your PostgreSQL database client (pgAdmin, DBeaver, etc.)
-- OR use psql command line:
-- psql -U postgres -d salon_db

-- Add branch column to bookings table
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS branch VARCHAR(100);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_bookings_branch ON bookings(branch);

-- Verify the migration
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'bookings' AND column_name = 'branch';

-- Success message
SELECT 'Branch field added to bookings table successfully!' AS message;
