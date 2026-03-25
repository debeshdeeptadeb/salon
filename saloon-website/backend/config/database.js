import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

/** Strip wrapping quotes some editors add to .env values */
function trimEnv(value) {
  if (value == null || typeof value !== 'string') return '';
  let s = value.trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1);
  }
  return s;
}

const databaseUrl = trimEnv(process.env.DATABASE_URL);
const useSslFlag = String(process.env.DB_SSL || '').toLowerCase() === 'true';
const urlImpliesSsl = /sslmode=require/i.test(databaseUrl);

let connectionString;
if (databaseUrl) {
  connectionString = databaseUrl;
} else {
  const DB_HOST = trimEnv(process.env.DB_HOST);
  const DB_PORT = trimEnv(process.env.DB_PORT) || '5432';
  const DB_NAME = trimEnv(process.env.DB_NAME);
  const DB_USER = trimEnv(process.env.DB_USER);
  const DB_PASSWORD = trimEnv(process.env.DB_PASSWORD);
  const missing = [];
  if (!DB_HOST) missing.push('DB_HOST');
  if (!DB_NAME) missing.push('DB_NAME');
  if (!DB_USER) missing.push('DB_USER');
  if (!DB_PASSWORD) missing.push('DB_PASSWORD');
  if (missing.length) {
    throw new Error(
      `Database config incomplete. Set DATABASE_URL, or set all of: ${missing.join(', ')}. ` +
        'See backend/.env.example.'
    );
  }
  connectionString = `postgresql://${encodeURIComponent(DB_USER)}:${encodeURIComponent(DB_PASSWORD)}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;
}

const useSsl = useSslFlag || urlImpliesSsl;

const pool = new Pool({
  connectionString,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: useSsl ? { rejectUnauthorized: false } : false,
});

// Test connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected database error:', err);
  process.exit(-1);
});

export default pool;
