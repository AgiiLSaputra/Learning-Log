import { useEffect, useState } from 'react';
import { api } from './lib/api.js';
import Dashboard from './components/Dashboard.jsx';
import EntriesPage from './components/EntriesPage.jsx';
import EntryForm from './components/EntryForm.jsx';
import ConfirmDialog from './components/ConfirmDialog.jsx';
import { SearchIcon, DashboardIcon, BookIcon, NavGridIcon, NavBookIcon, NavPlusIcon } from './components/icons.jsx';

export default function App() {
  // Mulai kosong — entri diisi oleh pengguna, tersimpan di PostgreSQL
  const [entries, setEntries] = useState([]);
  const [loadingDb, setLoadingDb] = useState(true);
  const [dbError, setDbError] = useState('');
  const [page, setPage] = useState('dashboard');
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({ tag: '', status: '', range: 'all' });
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null); // null = baru
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Muat entri dari database via backend saat aplikasi dibuka
  useEffect(() => {
    let alive = true;
    api
      .list()
      .then((list) => {
        if (!alive) return;
        setEntries(list);
        setDbError('');
      })
      .catch(() => {
        if (alive) setDbError('Tidak bisa terhubung ke server backend. Nyalakan PostgreSQL & folder Backend.');
      })
      .finally(() => {
        if (alive) setLoadingDb(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  // Fokus pada tanggal default: entri baru selalu pakai tanggal hari ini
  const openNewForm = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEditForm = (entry) => {
    setEditing(entry);
    setFormOpen(true);
  };

  const handleSearch = (value) => {
    setQuery(value);
    // Mengetik di pencarian langsung membawa pengguna ke daftar entri
    if (value && page === 'dashboard') setPage('entries');
  };

  // Simpan entri ke database (tambah baru / ubah)
  const submitEntry = async (data) => {
    try {
      if (editing?.id) {
        const updated = await api.update(editing.id, data);
        setEntries((prev) => prev.map((e) => (e.id === editing.id ? updated : e)));
      } else {
        const created = await api.create(data);
        setEntries((prev) => [...prev, created]);
      }
      setEditing(null);
      setFormOpen(false);
    } catch (err) {
      // Form tetap terbuka agar isian tidak hilang
      alert(`Gagal menyimpan entri: ${err.message}`);
    }
  };

  // Hapus entri dari database (setelah konfirmasi K-15)
  const confirmDelete = async () => {
    try {
      await api.remove(deleteTarget.id);
      setEntries((prev) => prev.filter((e) => e.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setDeleteTarget(null);
      alert(`Gagal menghapus entri: ${err.message}`);
    }
  };

  const isDashboard = page === 'dashboard';

  return (
    <div className="relative overflow-x-hidden antialiased min-h-screen flex flex-col">
      {/* Panel aplikasi — full screen, tanpa wallpaper */}
      <main className="relative z-10 flex-1 w-full min-h-screen bg-[#FEFEFE] flex flex-col justify-between p-5 pb-28 md:p-7 md:pb-8">
        {/* Header: mobile = logo tengah saja; desktop = search + logo + CTA */}
        <header className="w-full flex items-center justify-center md:justify-between z-20 pb-2">
          {/* Pencarian judul entri (FR-06) — hanya desktop; di mobile pencarian lewat halaman entri */}
          <div className="hidden md:flex items-center gap-2" data-purpose="search-container">
            <div className="relative flex items-center">
              <button
                aria-label="Cari"
                type="button"
                tabIndex={-1}
                className="absolute left-1 w-8 h-8 rounded-full bg-onyx flex items-center justify-center text-white shadow-sm pointer-events-none"
              >
                <SearchIcon />
              </button>
              <input
                type="text"
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Cari judul entri..."
                className="pl-11 pr-4 py-2 w-56 md:w-72 text-xs md:text-sm bg-[#F4F4F9] text-charcoal placeholder-muted rounded-full border-none focus:outline-none focus:ring-2 focus:ring-onyx/20 transition-all font-medium"
              />
            </div>
          </div>

          {/* Logo Learning Log (aset LogoLL.png) */}
          <div className="text-center select-none" data-purpose="brand-logo">
            <img src="/LogoLL.png" alt="Learning Log" className="h-11 w-auto mx-auto" draggable="false" />
          </div>

          {/* CTA: Tambah Entri (FR-01) — hanya desktop; di mobile lewat tombol + pada navigasi bawah */}
          <div className="hidden md:flex items-center" data-purpose="action-button-group">
            <button
              type="button"
              onClick={openNewForm}
              className="bg-limeAccent text-charcoal font-semibold text-xs md:text-sm px-5 py-2.5 rounded-full hover:brightness-105 active:scale-95 transition-all shadow-sm flex items-center gap-1.5"
            >
              <span className="text-base leading-none font-bold">+</span>
              <span>Tambah Entri</span>
            </button>
          </div>
        </header>

        {/* Banner status koneksi database */}
        {dbError && (
          <div className="mt-1 mb-2 rounded-2xl bg-[#FFF4EC] border border-[#F5D3B8] px-4 py-2.5 text-xs text-[#8A4B16] font-medium">
            ⚠️ {dbError}
          </div>
        )}

        {/* Isi: navigasi kiri ikon-only (desktop) + konten */}
        <div className="relative flex-1 flex flex-col md:grid md:grid-cols-12 gap-4 mt-3">
          {/* Navigasi samping kiri — hanya desktop (di mobile pakai pil bawah) */}
          <aside className="hidden md:flex flex-col items-center justify-between col-span-1 py-6 z-20">
            <nav aria-label="Menu Utama" className="flex md:flex-col flex-row items-center gap-5">
              <button
                aria-label="Dashboard"
                title="Dashboard"
                type="button"
                aria-current={isDashboard ? 'page' : undefined}
                onClick={() => setPage('dashboard')}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm ${
                  isDashboard
                    ? 'bg-onyx text-white shadow-md hover:scale-105'
                    : 'text-muted hover:text-charcoal hover:bg-[#F2F3F8]'
                }`}
              >
                <DashboardIcon />
              </button>
              <button
                aria-label="Daftar Entri"
                title="Daftar Entri"
                type="button"
                aria-current={!isDashboard ? 'page' : undefined}
                onClick={() => setPage('entries')}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  !isDashboard
                    ? 'bg-onyx text-white shadow-md hover:scale-105'
                    : 'text-muted hover:text-charcoal hover:bg-[#F2F3F8]'
                }`}
              >
                <BookIcon />
              </button>
            </nav>
            {/* Indikator titik vertikal halus */}
            <div className="hidden md:flex flex-col items-center gap-1.5 opacity-30">
              <span className="w-1 h-1 rounded-full bg-charcoal" />
              <span className="w-1 h-3 rounded-full bg-charcoal" />
              <span className="w-1 h-1 rounded-full bg-charcoal" />
            </div>
          </aside>

          {/* Konten tengah + kanan — col-span-11 seperti Dashboard.html (nav kanan sisi kiri col-1) */}
          <section className="col-span-12 md:col-span-11 relative flex flex-col justify-between pt-2">
            <div key={page} className="page-enter flex flex-col flex-1 justify-between">
              {isDashboard ? (
                <Dashboard entries={entries} onGoEntries={() => setPage('entries')} />
              ) : (
                <EntriesPage
                  entries={entries}
                  query={query}
                  onSearch={handleSearch}
                  filters={filters}
                  onFiltersChange={setFilters}
                  onEdit={openEditForm}
                  onRequestDelete={setDeleteTarget}
                  onAdd={openNewForm}
                />
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Navigasi pil mengapung di bawah — hanya mobile (Dmobile.html) */}
      <nav
        aria-label="Navigasi Utama"
        className="fixed bottom-5 inset-x-0 flex justify-center pointer-events-none z-30 md:hidden"
      >
        <div className="pointer-events-auto bg-white/95 backdrop-blur-md shadow-[0_10px_25px_rgba(0,0,0,0.12)] border border-[#D8D9E0]/60 rounded-full px-3 py-1.5 flex items-center gap-5">
          {/* Dashboard (aktif = lingkaran gelap) */}
          <button
            aria-label="Dashboard"
            title="Dashboard"
            type="button"
            onClick={() => setPage('dashboard')}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform active:scale-95 shadow-sm ${
              isDashboard ? 'bg-[#080812] text-white' : 'text-[#777985] hover:text-[#111116]'
            }`}
          >
            <NavGridIcon />
          </button>
          {/* Daftar Entri */}
          <button
            aria-label="Daftar Entri"
            title="Daftar Entri"
            type="button"
            onClick={() => setPage('entries')}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              !isDashboard ? 'bg-[#080812] text-white shadow-sm' : 'text-[#777985] hover:text-[#111116]'
            }`}
          >
            <NavBookIcon />
          </button>
          {/* Tambah Entri (akses cepat di mobile) */}
          <button
            aria-label="Tambah Entri"
            title="Tambah Entri"
            type="button"
            onClick={openNewForm}
            className="w-10 h-10 rounded-full bg-limeAccent text-charcoal flex items-center justify-center transition-transform active:scale-95 shadow-sm"
          >
            <NavPlusIcon />
          </button>
        </div>
      </nav>

      {/* Modal form tambah/ubah entri */}
      <EntryForm open={formOpen} initial={editing} entries={entries} onClose={() => { setFormOpen(false); setEditing(null); }} onSubmit={submitEntry} />

      {/* Dialog konfirmasi hapus (FR-03, K-15) */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        judul={deleteTarget?.judul || ''}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
