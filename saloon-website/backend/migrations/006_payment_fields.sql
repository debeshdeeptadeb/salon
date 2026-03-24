-- =============================================
-- MIGRATION 006: Payment Fields
-- =============================================

-- Add payment tracking columns to bookings
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS qr_source_id VARCHAR(100);

-- Add UPI payment info to site_settings
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS upi_qr_image_url VARCHAR(500);
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS upi_id VARCHAR(255);

-- Index for quick payment status queries
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);

-- =============================================
-- SUCCESS MESSAGE
-- =============================================
SELECT 'Migration 006 applied successfully - payment fields added!' AS message;
