/**
 * Promote an existing admin to platform owner (manages all salons).
 * Usage: node scripts/promote-super-admin.js admin@example.com
 */
import pool from '../config/database.js';

const email = process.argv[2];
if (!email) {
    console.error('Usage: node scripts/promote-super-admin.js <email>');
    process.exit(1);
}

async function run() {
    const r = await pool.query(
        `UPDATE admins SET role = 'super_admin', salon_id = NULL WHERE email = $1 RETURNING id, email, role`,
        [email.trim().toLowerCase()]
    );
    if (r.rows.length === 0) {
        console.error('No admin found with that email.');
        process.exit(1);
    }
    console.log('✅ Promoted:', r.rows[0]);
    await pool.end();
}

run().catch((e) => {
    console.error(e);
    process.exit(1);
});
