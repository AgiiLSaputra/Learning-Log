// Menyiapkan database Learning Log sesuai DATABASE_URL (.env)
// - Membuat database jika belum ada
// - Membuat tabel entries dari db/schema.sql
// Jalankan: npm run db:init
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { Pool } from 'pg';
import 'dotenv/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function ensureDatabase() {
  let pool;
  try {
    pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
    await pool.query('SELECT 1');
    return; // Database sudah ada & bisa diakses
  } catch (err) {
    // 3D000 = database tidak ada → buat otomatis lewat database "postgres"
    if (err.code !== '3D000') throw err;
  } finally {
    if (pool) await pool.end();
  }

  const url = new URL(process.env.DATABASE_URL);
  const dbName = url.pathname.replace(/^\//, '');
  if (!dbName) throw new Error('Nama database tidak ada di DATABASE_URL.');

  // Pool ke database bawaan untuk membuat database baru
  const admin = new Pool({
    connectionString: process.env.DATABASE_URL.replace(dbName, 'postgres'),
    max: 2,
  });
  try {
    await admin.query(`CREATE DATABASE "${dbName}"`);
    console.log(`✔ Database "${dbName}" dibuat.`);
  } finally {
    await admin.end();
  }
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL belum diisi di file .env');
  }

  await ensureDatabase();

  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
  try {
    const schemaPath = path.join(__dirname, '..', 'db', 'schema.sql');
    const sql = await readFile(schemaPath, 'utf8');
    await pool.query(sql);
    console.log('✔ Tabel "entries" siap (sudah dibuat / sudah ada).');
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error('✖ Gagal menyiapkan database:', err.message);
  console.error('  Pastikan PostgreSQL jalan dan password di file .env sudah benar.');
  process.exit(1);
});
