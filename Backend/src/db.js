// Pool koneksi PostgreSQL — dipakai semua endpoint di server.js
import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
});

// Tangkap error koneksi idle agar server tidak mati
pool.on('error', (err) => {
  console.error('[db] error koneksi PostgreSQL:', err.message);
});

export default pool;
