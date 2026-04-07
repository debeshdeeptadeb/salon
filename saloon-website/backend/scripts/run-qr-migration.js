import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import pool from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigration() {
    try {
        console.log('🔄 Running QR Codes migration...');

        const migrationPath = path.join(__dirname, '../migrations/005_qr_codes_schema.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

        await pool.query(migrationSQL);

        console.log('✅ QR Codes migration completed successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

runMigration();
