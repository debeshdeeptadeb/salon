import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'salon_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
});

async function setupDatabase() {
    const client = await pool.connect();

    try {
        console.log('🚀 Starting database setup...\n');

        // Read and execute schema migration
        console.log('📋 Creating database schema...');
        const schemaSQL = fs.readFileSync(
            path.join(__dirname, '../migrations/001_initial_schema.sql'),
            'utf8'
        );
        await client.query(schemaSQL);
        console.log('✅ Schema created successfully!\n');

        // Read seed data
        console.log('🌱 Inserting seed data...');
        let seedSQL = fs.readFileSync(
            path.join(__dirname, '../migrations/002_seed_data.sql'),
            'utf8'
        );

        // Generate a proper bcrypt hash for the admin password
        const adminPassword = 'Admin@123';
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        // Replace the placeholder with actual hashed password
        seedSQL = seedSQL.replace(
            '$2a$10$YourHashedPasswordWillGoHere',
            hashedPassword
        );

        await client.query(seedSQL);
        console.log('✅ Seed data inserted successfully!\n');

        console.log('🎉 Database setup completed successfully!');
        console.log('\n📝 Default Admin Credentials:');
        console.log('   Email: admin@minjalsalon.com');
        console.log('   Password: Admin@123');
        console.log('\n⚠️  Please change the default password after first login!\n');

    } catch (error) {
        console.error('❌ Error setting up database:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

// Run the setup
setupDatabase()
    .then(() => {
        console.log('✅ Setup script completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Setup script failed:', error);
        process.exit(1);
    });
