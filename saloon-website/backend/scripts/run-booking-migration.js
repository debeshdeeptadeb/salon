import pool from '../config/database.js';

async function runMigration() {
    try {
        console.log('Running migration: Add branch to bookings table...');

        // Execute migration statements
        await pool.query(`
            ALTER TABLE bookings 
            ADD COLUMN IF NOT EXISTS branch VARCHAR(100);
        `);

        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_bookings_branch ON bookings(branch);
        `);

        console.log('✅ Migration completed successfully!');
        console.log('Branch field added to bookings table.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    }
}

runMigration();
