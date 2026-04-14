import bcrypt from 'bcryptjs';
import pool from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const createAdminUser = async () => {
    try {
        const email = 'admin@minjalsalon.com';
        const password = 'Admin@123';
        const name = 'Admin User';

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Check if admin already exists
        const existing = await pool.query('SELECT * FROM admins WHERE email = $1', [email]);

        if (existing.rows.length > 0) {
            // Update existing admin
            await pool.query(
                'UPDATE admins SET password = $1, name = $2, role = $3, salon_id = NULL WHERE email = $4',
                [hashedPassword, name, 'super_admin', email]
            );
            console.log('✅ Admin user updated successfully');
        } else {
            // Create new admin
            await pool.query(
                'INSERT INTO admins (email, password, name, role, salon_id) VALUES ($1, $2, $3, $4, NULL)',
                [email, hashedPassword, name, 'super_admin']
            );
            console.log('✅ Admin user created successfully');
        }

        console.log('\nAdmin Credentials:');
        console.log('Email:', email);
        console.log('Password:', password);
        console.log('\n⚠️  Please change these credentials after first login!\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin user:', error);
        process.exit(1);
    }
};

createAdminUser();
