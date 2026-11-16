# Backend Learning Log (Node.js + Express + PostgreSQL)

API untuk menyimpan entri catatan belajar. Aplikasi frontend (`learning-log-app`)
mengambil & menyimpan datanya ke database PostgreSQL lewat backend ini.

## Persiapan (sekali saja)

1. **Install PostgreSQL** (jika belum) → https://www.postgresql.org/download/
2. **Buat databasenya** (pilih salah satu):
   - Lewat terminal: `createdb -U postgres learning_log`
   - Atau lewat pgAdmin / "CREATE DATABASE learning_log;"
3. **Edit file `.env`** di folder ini — ganti `GANTI_PASSWORD_KAMU` dengan password PostgreSQL kamu:
   ```
   DATABASE_URL=postgresql://postgres:PASSWORDKAMU@localhost:5432/learning_log
   ```
4. **Install dependency & buat tabel:**
   ```
   npm install
   npm run db:init
   ```

## Menjalankan server

```
npm run dev     # mode pengembangan (auto-restart saat file berubah)
npm start       # mode biasa
```

Server berjalan di `http://localhost:4000` (bisa diubah lewat `PORT` di `.env`).

## Endpoint

| Method | Path              | Keterangan                     |
|--------|-------------------|--------------------------------|
| GET    | /api/health       | Cek server & koneksi database  |
| GET    | /api/entries      | Semua entri (terbaru di atas)  |
| POST   | /api/entries      | Tambah entri                   |
| PUT    | /api/entries/:id  | Ubah entri                     |
| DELETE | /api/entries/:id  | Hapus entri                    |

## Catatan frontend

- Aplikasi frontend terhubung ke `http://localhost:4000/api`.
- Kalau backend berjalan di alamat lain, buat file `learning-log-app/.env` berisi:
  `VITE_API_URL=http://localhost:PORT/api`
- Pastikan backend & frontend dinyalakan bersamaan: terminal 1 `npm run dev` (folder Backend),
  terminal 2 `npm run dev` (folder learning-log-app).

## Struktur

```
Backend/
├── server.js           # Server Express + semua endpoint
├── src/db.js           # Pool koneksi PostgreSQL (pg)
├── db/schema.sql       # Skema tabel entries
├── scripts/init-table.js  # Membuat tabel dari schema.sql
├── .env                # Kredensial database (rahasia)
└── .env.example        # Contoh konfigurasi
```
