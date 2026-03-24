import pool from '../config/database.js';
import bcrypt from 'bcryptjs';

async function testAdminLogin() {
    const client = await pool.connect();

    try {
        console.log('🔐 Testing admin login...\n');

        // Check if admin exists
        const email = 'admin@minjalsalon.com';
        const password = 'Admin@123';

        const result = await client.query(
            'SELECT * FROM admins WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            console.log('❌ Admin user not found!');
            return;
        }

        const admin = result.rows[0];
        console.log('✅ Admin user found:');
        console.log(`   ID: ${admin.id}`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Name: ${admin.name}`);
        console.log(`   Role: ${admin.role}`);
        console.log(`   Password Hash: ${admin.password.substring(0, 20)}...`);
        console.log('');

        // Test password comparison
        console.log('🔑 Testing password comparison...');
        const isMatch = await bcrypt.compare(password, admin.password);

        if (isMatch) {
            console.log('✅ Password matches! Login should work.');
        } else {
            console.log('❌ Password does NOT match!');
            console.log('   This means the password hash is incorrect.');
            console.log('   Regenerating password hash...');

            const newHash = await bcrypt.hash(password, 10);
            await client.query(
                'UPDATE admins SET password = $1 WHERE email = $2',
                [newHash, email]
            );

            console.log('✅ Password hash updated successfully!');
            console.log('   Please try logging in again.');
        }

    } catch (error) {
        console.error('❌ Error testing login:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

testAdminLogin()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
