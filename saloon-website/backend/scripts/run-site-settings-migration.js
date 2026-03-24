import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import pool from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigration() {
    const client = await pool.connect();

    try {
        console.log('🚀 Running migration: 003_site_settings.sql\n');

        // Read the migration file
        const migrationPath = path.join(__dirname, '../migrations/003_site_settings.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

        // Execute the migration
        await client.query(migrationSQL);

        console.log('✅ Migration completed successfully!\n');

        // Verify the new tables
        const tablesQuery = `
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('site_settings', 'home_hero', 'home_services', 'home_prices')
            ORDER BY table_name;
        `;

        const result = await client.query(tablesQuery);
        console.log('📋 New tables created:');
        result.rows.forEach(row => {
            console.log(`   ✓ ${row.table_name}`);
        });

        // Check data
        const settingsCount = await client.query('SELECT COUNT(*) FROM site_settings');
        const heroCount = await client.query('SELECT COUNT(*) FROM home_hero');
        const servicesCount = await client.query('SELECT COUNT(*) FROM home_services');
        const pricesCount = await client.query('SELECT COUNT(*) FROM home_prices');

        console.log('\n📊 Seed data inserted:');
        console.log(`   ✓ site_settings: ${settingsCount.rows[0].count} record(s)`);
        console.log(`   ✓ home_hero: ${heroCount.rows[0].count} record(s)`);
        console.log(`   ✓ home_services: ${servicesCount.rows[0].count} record(s)`);
        console.log(`   ✓ home_prices: ${pricesCount.rows[0].count} record(s)`);

        console.log('\n✅ All done! Database is ready for content management.\n');

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

runMigration()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
