import pool from '../config/database.js';

async function verifyDatabase() {
    const client = await pool.connect();

    try {
        console.log('🔍 Verifying database setup...\n');

        // Check if all tables exist
        const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;

        const tablesResult = await client.query(tablesQuery);
        console.log('📋 Tables in database:');
        tablesResult.rows.forEach(row => {
            console.log(`   ✓ ${row.table_name}`);
        });
        console.log('');

        // Check content_pages specifically
        const contentPagesQuery = `SELECT COUNT(*) as count FROM content_pages;`;
        const contentResult = await client.query(contentPagesQuery);
        console.log(`📄 Content pages: ${contentResult.rows[0].count} records`);

        // Check admin users
        const adminQuery = `SELECT id, email, name, role FROM admins;`;
        const adminResult = await client.query(adminQuery);
        console.log(`👤 Admin users: ${adminResult.rows.length} records`);
        adminResult.rows.forEach(admin => {
            console.log(`   - ${admin.email} (${admin.name})`);
        });
        console.log('');

        // Check services
        const servicesQuery = `SELECT COUNT(*) as count FROM services;`;
        const servicesResult = await client.query(servicesQuery);
        console.log(`💇 Services: ${servicesResult.rows[0].count} records`);

        console.log('\n✅ Database verification completed successfully!');

    } catch (error) {
        console.error('❌ Error verifying database:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

verifyDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
