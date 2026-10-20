// Klien REST ke backend PostgreSQL (folder Backend/)
// Aplikasi tidak lagi memakai localStorage — semua data entri diambil dari database.
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Bersihkan cache versi lama (localStorage) — mulai kosong, data diisi dari database
try {
  localStorage.removeItem('learninglog.entries.v1');
} catch {
  /* diabaikan */
}

async function http(path, options = {}) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch {
    throw new Error('server tidak merespons');
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Daftar entri terbaru di atas (pengurutan juga dilakukan server)
  list: () => http('/entries'),
  // Tambah entri baru
  create: (data) => http('/entries', { method: 'POST', body: JSON.stringify(data) }),
  // Ubah entri berdasarkan id
  update: (id, data) => http(`/entries/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  // Hapus entri berdasarkan id
  remove: (id) => http(`/entries/${id}`, { method: 'DELETE' }),
};
