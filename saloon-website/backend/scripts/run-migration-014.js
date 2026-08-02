import pool from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function run() {
    const sql = fs.readFileSync(
        path.join(__dirname, '../migrations/014_unique_booking_slot.sql'),
        'utf8'
    );
    await pool.query(sql);
    console.log('Migration 014_unique_booking_slot applied.');
    await pool.end();
}

run().catch((err) => {
    console.error(err);
    process.exit(1);
});
