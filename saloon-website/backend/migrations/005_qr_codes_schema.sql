-- =============================================
-- QR CODE MANAGEMENT SCHEMA
-- =============================================

-- Drop existing table if it exists
DROP TABLE IF EXISTS salon_qr_codes CASCADE;

-- =============================================
-- SALON QR CODES TABLE
-- =============================================
CREATE TABLE salon_qr_codes (
  id SERIAL PRIMARY KEY,
  qr_code_id VARCHAR(100) UNIQUE NOT NULL,  -- Unique identifier for QR URL (e.g., "qr_1234567890_abc")
  qr_image_url VARCHAR(500),                 -- Path to generated QR image (e.g., "/uploads/qr/qr_1234567890_abc.png")
  label VARCHAR(255),                        -- Optional label (e.g., "Main Entrance", "Reception", "VIP Lounge")
  is_active BOOLEAN DEFAULT true,            -- Whether QR code is active
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX idx_qr_codes_active ON salon_qr_codes(is_active);
CREATE INDEX idx_qr_codes_id ON salon_qr_codes(qr_code_id);

-- =============================================
-- SUCCESS MESSAGE
-- =============================================
SELECT 'QR Codes schema created successfully!' AS message;
