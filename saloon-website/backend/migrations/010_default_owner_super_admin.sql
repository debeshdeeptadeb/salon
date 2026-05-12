-- =============================================
-- Migration 007 renames role 'admin' -> 'salon_admin' for all admins.
-- The seeded default account (002_seed_data.sql) should remain the
-- platform owner so "Salons (tenants)" appears in the admin sidebar.
-- Idempotent: safe to run multiple times.
-- =============================================

UPDATE admins
SET role = 'super_admin', salon_id = NULL
WHERE LOWER(TRIM(email)) = 'admin@minjalsalon.com';

SELECT '010 default owner super_admin migration completed' AS message;
