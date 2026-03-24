import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;

const createDatabase = async () => {
    // Connect to default postgres database to create salon_db
    const client = new Client({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: 'postgres', // Connect to default database
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD,
    });

    try {
        await client.connect();
        console.log('✅ Connected to PostgreSQL');

        // Check if database exists
        const checkDb = await client.query(
            "SELECT 1 FROM pg_database WHERE datname = 'salon_db'"
        );

        if (checkDb.rows.length === 0) {
            // Create database
            await client.query('CREATE DATABASE salon_db');
            console.log('✅ Database "salon_db" created successfully');
        } else {
            console.log('ℹ️  Database "salon_db" already exists');
        }

        await client.end();
        console.log('\n✅ Database setup complete!');
        console.log('Now run: node scripts/setup-db.js\n');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

createDatabase();
