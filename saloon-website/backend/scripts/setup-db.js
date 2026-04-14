import fs from 'fs';
import pool from '../config/database.js';
import bcrypt from 'bcryptjs';

const setupDatabase = async () => {
    try {
        console.log('🔧 Setting up database...\n');

        // Read and execute schema
        console.log('📋 Creating database schema...');
        const schema = fs.readFileSync('./migrations/001_initial_schema.sql', 'utf8');
        await pool.query(schema);
        console.log('✅ Schema created successfully\n');

        // Read and execute seed data (excluding admin user)
        console.log('🌱 Inserting seed data...');
        const seedData = fs.readFileSync('./migrations/002_seed_data.sql', 'utf8');
        // Remove the admin insert line as we'll do it separately with proper hashing
        const seedDataWithoutAdmin = seedData.replace(/INSERT INTO admins.*?;/s, '');
        await pool.query(seedDataWithoutAdmin);
        console.log('✅ Seed data inserted successfully\n');

        // Create admin user with hashed password
        console.log('👤 Creating admin user...');
        const email = 'admin@minjalsalon.com';
        const password = 'Admin@123';
        const name = 'Admin User';

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await pool.query(
            `INSERT INTO admins (email, password, name, role, salon_id)
             VALUES ($1, $2, $3, $4, NULL)
             ON CONFLICT (email) DO UPDATE SET
               password = EXCLUDED.password,
               name = EXCLUDED.name,
               role = EXCLUDED.role,
               salon_id = NULL`,
            [email, hashedPassword, name, 'super_admin']
        );
        console.log('✅ Admin user created successfully\n');

        console.log('🎉 Database setup complete!\n');
        console.log('Admin Credentials:');
        console.log('  Email:', email);
        console.log('  Password:', password);
        console.log('\n⚠️  Please change these credentials after first login!\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error setting up database:', error.message);

        if (error.code === 'ECONNREFUSED') {
            console.error('\n💡 Make sure PostgreSQL is running and credentials in .env are correct');
        }

        process.exit(1);
    }
};

setupDatabase();
