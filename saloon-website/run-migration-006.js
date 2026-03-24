import pool from './backend/config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, 'backend', '.env') });

async function runMigration() {
    try {
        console.log('Connecting to database...');
        const sqlPath = path.join(__dirname, './backend/migrations/006_payment_fields.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Executing migration 006_payment_fields.sql...');
        const res = await pool.query(sql);
        console.log('Migration successful:', res[res.length - 1]?.rows[0]?.message || 'Success');

        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
