-- =============================================
-- ADD BRANCH FIELD TO BOOKINGS TABLE
-- =============================================

-- Add branch column to bookings table
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS branch VARCHAR(100);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_bookings_branch ON bookings(branch);

-- Add comment for documentation
COMMENT ON COLUMN bookings.branch IS 'Branch location: Cuttack, Bhubaneswar, or Baripada';

-- Success message
SELECT 'Branch field added to bookings table successfully!' AS message;
