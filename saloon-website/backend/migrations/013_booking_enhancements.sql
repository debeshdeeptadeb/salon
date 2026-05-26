-- Pay at salon, payment screenshot, slot lookup support
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'upi_online';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_screenshot_url VARCHAR(500);

CREATE INDEX IF NOT EXISTS idx_bookings_slot_lookup
    ON bookings (salon_id, booking_date, booking_time, branch)
    WHERE status IS DISTINCT FROM 'cancelled';
