import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../config/database.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function run() {
    const sqlPath = path.join(__dirname, '../migrations/007_multi_tenant_salons.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    try {
        await pool.query(sql);
        console.log('✅ Migration 007 applied successfully.');
    } catch (e) {
        console.error('❌ Migration failed:', e.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

run();
