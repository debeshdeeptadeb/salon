import dotenv from 'dotenv';

dotenv.config();

const required = [
    'NODE_ENV',
    'DB_HOST',
    'DB_PORT',
    'DB_NAME',
    'DB_USER',
    'DB_PASSWORD',
    'JWT_SECRET',
    'FRONTEND_URL',
];

const missing = required.filter((key) => !process.env[key] || !String(process.env[key]).trim());

if (missing.length) {
    console.error('Missing required production env vars:');
    missing.forEach((key) => console.error(`- ${key}`));
    process.exit(1);
}

if (process.env.NODE_ENV !== 'production') {
    console.warn(`NODE_ENV is "${process.env.NODE_ENV}". Expected "production".`);
}

if (!process.env.FRONTEND_URL.includes('https://')) {
    console.warn('FRONTEND_URL should use https in production.');
}

if ((process.env.JWT_SECRET || '').length < 32) {
    console.warn('JWT_SECRET is short. Use a longer random secret (recommended: 64+ chars).');
}

console.log('Production preflight check passed.');
