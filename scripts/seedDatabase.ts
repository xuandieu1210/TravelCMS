import 'dotenv/config';
import { Pool } from 'pg';
import {
  INITIAL_TOURS,
  INITIAL_SERVICES,
  INITIAL_BOOKINGS,
  INITIAL_CUSTOMERS,
  INITIAL_BANNERS,
  INITIAL_POSTS,
  INITIAL_FEEDBACKS,
  INITIAL_CAMPAIGNS,
  INITIAL_MEDIA_FILES,
  INITIAL_AUDIT_LOGS,
  INITIAL_CATEGORIES,
  INITIAL_ADMIN_USERS,
  INITIAL_SITE_CONFIG,
} from '../src/data/mockData';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL chưa được cấu hình trong file .env');
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
});

const collections = [
  ['tours', INITIAL_TOURS],
  ['services', INITIAL_SERVICES],
  ['bookings', INITIAL_BOOKINGS],
  ['customers', INITIAL_CUSTOMERS],
  ['banners', INITIAL_BANNERS],
  ['posts', INITIAL_POSTS],
  ['feedbacks', INITIAL_FEEDBACKS],
  ['campaigns', INITIAL_CAMPAIGNS],
  ['media', INITIAL_MEDIA_FILES],
  ['audit_logs', INITIAL_AUDIT_LOGS],
  ['categories', INITIAL_CATEGORIES],
  ['users', INITIAL_ADMIN_USERS],
  ['site_config', [{ id: 'main', ...INITIAL_SITE_CONFIG }]],
] as const;

async function seedDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS app_records (
      collection TEXT NOT NULL,
      id TEXT NOT NULL,
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (collection, id)
    )
  `);

  let inserted = 0;
  for (const [collection, records] of collections) {
    for (const record of records) {
      const result = await pool.query(
        `INSERT INTO app_records (collection, id, data)
         VALUES ($1, $2, $3::jsonb)
         ON CONFLICT (collection, id) DO NOTHING`,
        [collection, record.id, JSON.stringify(record)],
      );
      inserted += result.rowCount || 0;
    }
  }

  const result = await pool.query(
    'SELECT collection, COUNT(*)::int AS count FROM app_records GROUP BY collection ORDER BY collection',
  );

  console.log(`[PostgreSQL] Đã tạo bảng app_records và thêm ${inserted} bản ghi mới.`);
  console.table(result.rows);
}

seedDatabase()
  .catch((error) => {
    console.error('[PostgreSQL] Seed thất bại:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
