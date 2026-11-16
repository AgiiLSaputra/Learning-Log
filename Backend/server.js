// Backend Learning Log — Node.js + Express + PostgreSQL (pg)
// API utama:
//   GET    /api/health    → cek server & koneksi database
//   GET    /api/entries   → semua entri (terbaru di atas)
//   POST   /api/entries   → tambah entri
//   PUT    /api/entries/:id → ubah entri
//   DELETE /api/entries/:id → hapus entri
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pool from './src/db.js';

const app = express();
const PORT = Number(process.env.PORT) || 4000;
const ALLOWED_STATUS = ['Sedang dipelajari', 'Selesai', 'Mau diulang'];

app.use(cors());
app.use(express.json());

const FIELDS =
  'id, judul, tanggal::text AS tanggal, durasi, sumber, status, paham, dipelajari, bingung, tags, created_at';

// Bungkus handler agar error async otomatis diteruskan ke error middleware
const h = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res)).catch(next);
};

const httpError = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

// Baris PostgreSQL → bentuk entri yang dipakai frontend
function rowToEntry(r) {
  return {
    id: r.id,
    judul: r.judul,
    tanggal: r.tanggal,
    durasi: r.durasi,
    sumber: Array.isArray(r.sumber) ? r.sumber : [],
    status: r.status,
    paham: r.paham,
    dipelajari: r.dipelajari,
    bingung: r.bingung ?? '',
    tags: Array.isArray(r.tags) ? r.tags : [],
    createdAt: new Date(r.created_at).getTime(),
  };
}

// Validasi payload (FR-04/K-06: judul, tanggal, durasi, status, paham, ringkasan, tag)
function parseBody(body = {}) {
  const judul = String(body.judul ?? '').trim();
  const tanggal = String(body.tanggal ?? '').trim();
  const durasi = Math.round(Number(body.durasi));
  const paham = Math.round(Number(body.paham));
  const status = body.status;
  const dipelajari = String(body.dipelajari ?? '').trim();
  const bingung = String(body.bingung ?? '').trim();
  const tags = Array.isArray(body.tags) ? body.tags.map((t) => String(t).trim()).filter(Boolean) : [];
  const sumber = Array.isArray(body.sumber) ? body.sumber.map((s) => String(s).trim()).filter(Boolean) : [];

  if (!judul) throw httpError(400, 'Judul wajib diisi.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(tanggal)) throw httpError(400, 'Format tanggal tidak valid.');
  if (!Number.isFinite(durasi) || durasi <= 0) throw httpError(400, 'Durasi harus lebih dari 0 menit.');
  if (!ALLOWED_STATUS.includes(status)) throw httpError(400, 'Status tidak valid.');
  if (!Number.isFinite(paham) || paham < 1 || paham > 5) throw httpError(400, 'Tingkat paham harus 1-5.');
  if (!dipelajari) throw httpError(400, 'Rincian "apa yang dipelajari" wajib diisi.');
  if (tags.length === 0) throw httpError(400, 'Minimal satu tag.');

  return { judul, tanggal, durasi, paham, status, dipelajari, bingung, tags, sumber };
}

// Health check — untuk memastikan server + database hidup
app.get(
  '/api/health',
  h(async (_req, res) => {
    await pool.query('SELECT 1');
    res.json({ ok: true });
  }),
);

// Semua entri, terbaru di atas (K-8)
app.get(
  '/api/entries',
  h(async (_req, res) => {
    const { rows } = await pool.query(
      `SELECT ${FIELDS} FROM entries ORDER BY tanggal DESC, created_at DESC`,
    );
    res.json(rows.map(rowToEntry));
  }),
);

// Tambah entri
app.post(
  '/api/entries',
  h(async (req, res) => {
    const d = parseBody(req.body);
    const { rows } = await pool.query(
      `INSERT INTO entries (judul, tanggal, durasi, sumber, status, paham, dipelajari, bingung, tags)
       VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7, $8, $9::jsonb)
       RETURNING ${FIELDS}`,
      [d.judul, d.tanggal, d.durasi, JSON.stringify(d.sumber), d.status, d.paham, d.dipelajari, d.bingung, JSON.stringify(d.tags)],
    );
    res.status(201).json(rowToEntry(rows[0]));
  }),
);

// Ubah entri
app.put(
  '/api/entries/:id',
  h(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) throw httpError(400, 'ID tidak valid.');
    const d = parseBody(req.body);
    const { rows } = await pool.query(
      `UPDATE entries
       SET judul=$2, tanggal=$3, durasi=$4, sumber=$5::jsonb, status=$6, paham=$7, dipelajari=$8, bingung=$9, tags=$10::jsonb
       WHERE id=$1
       RETURNING ${FIELDS}`,
      [id, d.judul, d.tanggal, d.durasi, JSON.stringify(d.sumber), d.status, d.paham, d.dipelajari, d.bingung, JSON.stringify(d.tags)],
    );
    if (rows.length === 0) throw httpError(404, 'Entri tidak ditemukan.');
    res.json(rowToEntry(rows[0]));
  }),
);

// Hapus entri
app.delete(
  '/api/entries/:id',
  h(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) throw httpError(400, 'ID tidak valid.');
    const { rows } = await pool.query(`DELETE FROM entries WHERE id=$1 RETURNING id`, [id]);
    if (rows.length === 0) throw httpError(404, 'Entri tidak ditemukan.');
    res.json({ ok: true });
  }),
);

// Middleware error terakhir
app.use((err, _req, res, _next) => {
  if (err.status) {
    return res.status(err.status).json({ error: err.message });
  }
  console.error('[server] error:', err.message);
  res.status(500).json({ error: 'Terjadi kesalahan di server.' });
});

app.listen(PORT, () => {
  console.log(`✔ Backend Learning Log berjalan di http://localhost:${PORT}`);
  console.log(`  DB: ${process.env.DATABASE_URL ? process.env.DATABASE_URL.replace(/:[^:@/]+@/, ':***@') : '(DATABASE_URL belum diisi)'}`);
});
