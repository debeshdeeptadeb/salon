-- Prevent two active bookings on the exact same start slot (salon + date + time + branch).
-- Duration overlaps are still checked in application code.

-- Keep the earliest booking when duplicates exist so the unique index can be created.
WITH ranked AS (
    SELECT id,
           ROW_NUMBER() OVER (
               PARTITION BY salon_id, booking_date, booking_time, branch
               ORDER BY created_at ASC NULLS LAST, id ASC
           ) AS rn
    FROM bookings
    WHERE status IS DISTINCT FROM 'cancelled'
)
UPDATE bookings b
SET status = 'cancelled',
    updated_at = CURRENT_TIMESTAMP
FROM ranked r
WHERE b.id = r.id
  AND r.rn > 1;

CREATE UNIQUE INDEX IF NOT EXISTS uniq_bookings_active_slot
    ON bookings (salon_id, booking_date, booking_time, branch)
    WHERE status IS DISTINCT FROM 'cancelled';
