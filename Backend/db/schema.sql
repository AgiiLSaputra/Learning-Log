-- Skema database Learning Log
-- Jalankan otomatis lewat: npm run db:init
-- (atau manual: psql -d learning_log -f db/schema.sql)

CREATE TABLE IF NOT EXISTS entries (
  id          SERIAL PRIMARY KEY,
  judul       TEXT NOT NULL,
  tanggal     DATE NOT NULL,
  durasi      INTEGER NOT NULL CHECK (durasi > 0),
  sumber      JSONB NOT NULL DEFAULT '[]'::jsonb,
  status      TEXT NOT NULL DEFAULT 'Sedang dipelajari'
              CHECK (status IN ('Sedang dipelajari', 'Selesai', 'Mau diulang')),
  paham       SMALLINT NOT NULL CHECK (paham BETWEEN 1 AND 5),
  dipelajari  TEXT NOT NULL,
  bingung     TEXT NOT NULL DEFAULT '',
  tags        JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index agar daftar entri (urut tanggal terbaru) cepat
CREATE INDEX IF NOT EXISTS entries_tanggal_idx ON entries (tanggal DESC);
