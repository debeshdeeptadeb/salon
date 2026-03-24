-- =============================================
-- SITE SETTINGS & HOME CONTENT SCHEMA
-- =============================================

-- Drop existing tables if they exist
DROP TABLE IF EXISTS home_prices CASCADE;
DROP TABLE IF EXISTS home_services CASCADE;
DROP TABLE IF EXISTS home_hero CASCADE;
DROP TABLE IF EXISTS site_settings CASCADE;

-- =============================================
-- SITE SETTINGS TABLE
-- =============================================
CREATE TABLE site_settings (
  id SERIAL PRIMARY KEY,
  navbar_logo_url VARCHAR(500),
  footer_logo_url VARCHAR(500),
  site_name VARCHAR(255) DEFAULT 'MINJAL',
  site_tagline VARCHAR(255) DEFAULT 'Luxury Salon',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- HOME HERO SECTION TABLE
-- =============================================
CREATE TABLE home_hero (
  id SERIAL PRIMARY KEY,
  badge_text VARCHAR(255) DEFAULT 'Bhubaneswar''s Premier Luxury Salon',
  title_main VARCHAR(255) DEFAULT 'Where Elegance Meets Expert Care',
  title_highlight VARCHAR(100) DEFAULT 'Elegance',
  subtitle TEXT DEFAULT 'Experience world-class beauty and grooming services in an atmosphere of refined luxury. Your transformation begins here.',
  stat_years INTEGER DEFAULT 10,
  stat_clients INTEGER DEFAULT 5000,
  stat_services INTEGER DEFAULT 50,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- HOME SERVICES PREVIEW TABLE
-- =============================================
CREATE TABLE home_services (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(50) DEFAULT '✨',
  image_url VARCHAR(500),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- HOME PRICES TABLE
-- =============================================
CREATE TABLE home_prices (
  id SERIAL PRIMARY KEY,
  service_name VARCHAR(255) NOT NULL,
  price VARCHAR(100) NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- SEED DEFAULT DATA
-- =============================================

-- Insert default site settings
INSERT INTO site_settings (navbar_logo_url, footer_logo_url, site_name, site_tagline)
VALUES ('/uploads/logo/minjal-salon-logo.svg', '/uploads/logo/minjal-salon-logo.svg', 'MINJAL', 'Luxury Salon');

-- Insert default hero content
INSERT INTO home_hero (badge_text, title_main, title_highlight, subtitle, stat_years, stat_clients, stat_services)
VALUES (
  'Bhubaneswar''s Premier Luxury Salon',
  'Where Elegance Meets Expert Care',
  'Elegance',
  'Experience world-class beauty and grooming services in an atmosphere of refined luxury. Your transformation begins here.',
  10,
  5000,
  50
);

-- Insert default services preview
INSERT INTO home_services (title, description, icon, image_url, display_order, is_active) VALUES
('Hair Styling', 'Precision cuts, styling & treatments', '✂', 'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?q=80&w=1200&auto=format&fit=crop', 1, true),
('Nail Care', 'Luxury manicure & pedicure services', '💅', 'https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=1200&auto=format&fit=crop', 2, true),
('Skin & Spa', 'Relaxing facials & skin therapies', '✨', 'https://images.unsplash.com/photo-1582095133179-bfd08e2fc6b3?q=80&w=1200&auto=format&fit=crop', 3, true),
('Bridal Makeup', 'Exquisite bridal beauty packages', '👰', 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?q=80&w=1200&auto=format&fit=crop', 4, true);

-- Insert default prices
INSERT INTO home_prices (service_name, price, display_order, is_active) VALUES
('Hair Styling', '₹999+', 1, true),
('Nail Care', '₹699+', 2, true),
('Makeup', '₹1999+', 3, true),
('Spa Therapy', '₹1499+', 4, true);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX idx_home_services_active ON home_services(is_active);
CREATE INDEX idx_home_services_order ON home_services(display_order);
CREATE INDEX idx_home_prices_active ON home_prices(is_active);
CREATE INDEX idx_home_prices_order ON home_prices(display_order);

-- =============================================
-- SUCCESS MESSAGE
-- =============================================
SELECT 'Site settings and home content schema created successfully!' AS message;
