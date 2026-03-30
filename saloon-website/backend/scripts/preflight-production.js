import dotenv from 'dotenv';

dotenv.config();

const required = ['NODE_ENV', 'JWT_SECRET', 'FRONTEND_URL'];

const missingCore = required.filter((key) => !process.env[key] || !String(process.env[key]).trim());

const hasDatabaseUrl = !!(process.env.DATABASE_URL && String(process.env.DATABASE_URL).trim());
const dbPartsRequired = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
const missingDbParts = dbPartsRequired.filter((key) => !process.env[key] || !String(process.env[key]).trim());

const missing = hasDatabaseUrl ? missingCore : [...missingCore, ...missingDbParts];

if (missing.length) {
    console.error('Missing required production env vars:');
    missing.forEach((key) => console.error(`- ${key}`));
    if (!hasDatabaseUrl) {
        console.error('- DATABASE_URL (alternative to DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD)');
    }
    process.exit(1);
}

if (process.env.NODE_ENV !== 'production') {
    console.warn(`NODE_ENV is "${process.env.NODE_ENV}". Expected "production".`);
}

if (!process.env.FRONTEND_URL.includes('https://')) {
    console.warn('FRONTEND_URL should use https in production.');
}

if (hasDatabaseUrl && !/sslmode=require/i.test(process.env.DATABASE_URL)) {
    console.warn('DATABASE_URL does not include sslmode=require. Managed Postgres providers usually require SSL.');
}

if ((process.env.JWT_SECRET || '').length < 32) {
    console.warn('JWT_SECRET is short. Use a longer random secret (recommended: 64+ chars).');
}

console.log('Production preflight check passed.');
