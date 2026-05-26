-- Customer-submitted UPI transaction reference for manual verification
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_reference VARCHAR(50);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_confirmed_at TIMESTAMP;
