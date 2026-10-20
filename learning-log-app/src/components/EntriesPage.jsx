// Daftar entri (FR-06, FR-07, FR-08) — urutan default: terbaru di atas (K-8)
// Desktop mengikuti entri.html · Mobile mengikuti entriMobile.html
// Navigasi bawah tetap versi aplikasi (pil mengapung) agar konsisten antar halaman
import { useEffect, useMemo, useRef, useState } from 'react';
import { allTags } from '../lib/stats.js';
import { dateLabel, parseISO, todayISO, addDaysISO, startOfWeekISO } from '../lib/date.js';
import { PencilIcon, TrashIcon, LinkIcon } from './icons.jsx';
import Reveal from './Reveal.jsx';

const STATUS_LIST = ['Sedang dipelajari', 'Selesai', 'Mau diulang'];

// Durasi pendek: 1j 30m · 2j · 45m
function formatShort(menit) {
  const j = Math.floor(menit / 60);
  const m = menit % 60;
  if (j === 0) return `${m}m`;
  if (m === 0) return `${j}j`;
  return `${j}j ${m}m`;
}

// Gaya pill status desktop (entri.html): Sedang dipelajari gelap, lainnya outline putih
function statusClass(status) {
  if (status === 'Sedang dipelajari') return 'bg-[#080812] text-white';
  return 'bg-white border border-[#D8D9E0] text-[#111116] font-medium';
}

// Gaya pill status mobile (entriMobile.html)
function mobileStatusClass(status) {
  if (status === 'Sedang dipelajari') return 'bg-[#1B1B25] text-white font-medium';
  if (status === 'Selesai') return 'bg-[#B7F489] text-[#0B2000] font-semibold';
  return 'bg-[#F2F3F8] text-[#111116] font-medium';
}

export default function EntriesPage({
  entries,
  query,
  onSearch,
  filters,
  onFiltersChange,
  onEdit,
  onRequestDelete,
  onAdd,
}) {
  const tags = useMemo(() => allTags(entries), [entries]);

  // Opsi filter (FR-07)
  const tagOptions = [
    { value: '', label: 'Semua tag' },
    ...tags.map((t) => ({ value: t, label: t })),
  ];
  const statusOptions = [
    { value: '', label: 'Semua status' },
    ...STATUS_LIST.map((s) => ({ value: s, label: s })),
  ];
  const rangeOptions = [
    { value: 'all', label: 'Semua tanggal' },
    { value: 'today', label: 'Hari ini' },
    { value: '7d', label: '7 hari terakhir' },
    { value: 'week', label: 'Minggu ini' },
    { value: 'month', label: 'Bulan ini' },
  ];

  // Konversi preset rentang tanggal menjadi batas from–to
  const bounds = useMemo(() => {
    const today = todayISO();
    if (filters.range === 'today') return { from: today, to: today };
    if (filters.range === '7d') return { from: addDaysISO(today, -6), to: today };
    if (filters.range === 'week') {
      const mon = startOfWeekISO(today);
      return { from: mon, to: addDaysISO(mon, 6) };
    }
    if (filters.range === 'month') {
      const d = parseISO(today);
      const from = toISOof(new Date(d.getFullYear(), d.getMonth(), 1));
      const to = toISOof(new Date(d.getFullYear(), d.getMonth() + 1, 0));
      return { from, to };
    }
    return { from: '', to: '' };
  }, [filters.range]);

  // Pencarian judul (FR-06) + filter tag/status/tanggal (FR-07)
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries
      .filter((e) => (q ? e.judul.toLowerCase().includes(q) : true))
      .filter((e) => (filters.tag ? e.tags.includes(filters.tag) : true))
      .filter((e) => (filters.status ? e.status === filters.status : true))
      .filter((e) => (bounds.from ? e.tanggal >= bounds.from : true))
      .filter((e) => (bounds.to ? e.tanggal <= bounds.to : true))
      .sort(
        (a, b) =>
          b.tanggal.localeCompare(a.tanggal) || (b.createdAt || 0) - (a.createdAt || 0),
      );
  }, [entries, query, filters, bounds]);

  const hasActiveFilter = Boolean(filters.tag || filters.status || filters.range !== 'all');

  // Data banner mini (konsistensi minggu ini)
  const banner = useMemo(() => {
    const today = todayISO();
    const mon = startOfWeekISO(today);
    const akhir = addDaysISO(mon, 6);
    const mingguIni = entries.filter((e) => e.tanggal >= mon && e.tanggal <= akhir);
    return {
      jumlah: mingguIni.length,
      hari: new Set(mingguIni.map((e) => e.tanggal)).size,
    };
  }, [entries]);

  return (
    <main className="flex-1 flex flex-col min-w-0 relative z-10">
      {/* ============ VERSI MOBILE (entriMobile.html) ============ */}
      <section className="md:hidden flex flex-col w-full space-y-4" data-purpose="mobile-entries">
        {/* Search bar full-width pill */}
        <Reveal className="relative w-full" data-purpose="mobile-search">
          <div className="w-full flex items-center bg-[#F2F3F8] rounded-full pl-1.5 pr-4 py-1.5 shadow-[0_2px_8px_rgba(17,17,22,0.03)]">
            <div className="w-9 h-9 rounded-full bg-[#1B1B25] flex items-center justify-center shrink-0 text-white">
              <SearchIconMobile />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Cari judul…"
              className="w-full bg-transparent outline-none px-3 text-sm text-[#111116] placeholder-[#777985] font-medium"
            />
          </div>
        </Reveal>

        {/* Headline & karakter muncul dari kanan bawah */}
        <Reveal
          className="relative w-full overflow-hidden rounded-[24px] bg-gradient-to-r from-[#F8F8FB] via-white to-[#F2F3F8] p-4 shadow-[0_4px_16px_rgba(17,17,22,0.02)]"
          delay={80}
        >
          <div className="absolute -right-2 -bottom-2 w-32 h-36 opacity-85 pointer-events-none select-none z-0">
            <img
              alt="Karakter Learning Log"
              className="w-full h-full object-contain object-top"
              src="/character.png"
            />
          </div>
          <div className="relative z-10 flex flex-col max-w-[68%]">
            <div className="flex flex-col items-start gap-1">
              <span className="text-[26px] font-bold text-[#111116] tracking-tight leading-tight">Catatan</span>
              <div className="px-2.5 py-0.5 rounded-full bg-[#F3F3F4] shadow-[inset_0_0_0_1px_rgba(216,217,224,0.7)] flex items-center">
                <span className="text-sm font-semibold text-[#111116]">belajar kamu</span>
              </div>
            </div>
            <p className="text-xs text-[#777985] mt-2 leading-relaxed">
              Menampilkan seluruh entri belajar pribadi.
            </p>
          </div>
        </Reveal>

        {/* Filter row — pil gaya mobile */}
        <Reveal className="w-full" delay={160} data-purpose="mobile-filters">
          <div className="flex flex-wrap items-center gap-2 py-0.5">
            {/* Chip tag aktif + dropdown Semua tag */}
            {filters.tag ? (
              <div className="inline-flex items-center gap-1.5 h-8 pl-3 pr-2 rounded-full bg-[#1B1B25] text-white text-xs font-semibold shadow-sm">
                <span>Tag: {filters.tag}</span>
                <button
                  type="button"
                  aria-label={`Hapus filter tag ${filters.tag}`}
                  onClick={() => onFiltersChange({ ...filters, tag: '' })}
                  className="opacity-80 hover:opacity-100"
                >
                  <CloseIconMobile />
                </button>
              </div>
            ) : null}
            <Dropdown
              compact
              fallbackLabel={filters.tag ? filters.tag : 'Semua tag'}
              value={filters.tag}
              options={tagOptions}
              onChange={(v) => onFiltersChange({ ...filters, tag: v })}
            />
            <Dropdown
              compact
              fallbackLabel="Semua status"
              value={filters.status}
              options={statusOptions}
              onChange={(v) => onFiltersChange({ ...filters, status: v })}
            />
            <Dropdown
              compact
              fallbackLabel="Rentang tanggal"
              fallbackWhen="all"
              value={filters.range}
              options={rangeOptions}
              onChange={(v) => onFiltersChange({ ...filters, range: v })}
            />
            {hasActiveFilter && (
              <button
                type="button"
                onClick={() => onFiltersChange({ tag: '', status: '', range: 'all' })}
                className="text-xs font-medium text-[#777985] hover:text-[#111116] px-2 transition-colors"
              >
                Reset filter
              </button>
            )}
          </div>
        </Reveal>

        {/* Daftar kartu entri gaya mobile */}
        <div className="flex flex-col space-y-3 w-full" data-purpose="mobile-entry-list">
          {filtered.map((e, i) => (
            <Reveal key={e.id} delay={Math.min(i * 60, 300)}>
              <MobileEntryCard entry={e} onEdit={onEdit} onRequestDelete={onRequestDelete} />
            </Reveal>
          ))}
          {filtered.length === 0 && (
            <EmptyState
              compact
              emptyAll={entries.length === 0}
              hasFilter={hasActiveFilter || query.trim().length > 0}
              onAdd={onAdd}
              onSearch={onSearch}
              onFiltersChange={onFiltersChange}
            />
          )}
        </div>

        {/* Banner mini insight */}
        {banner.jumlah > 0 && (
          <Reveal
            className="w-full rounded-[20px] bg-gradient-to-r from-[#F2E0C9]/30 to-[#E4E1F0]/20 p-3.5 flex items-center gap-3"
            delay={120}
            data-purpose="consistency-banner"
          >
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm text-[#376A0E]">
              <TrendIconMobile />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-[#111116]">Konsistensi Pekan Ini</span>
              <span className="text-xs text-[#777985] truncate">
                {banner.jumlah} entri dipelajari dalam {banner.hari} hari minggu ini!
              </span>
            </div>
          </Reveal>
        )}
      </section>

      {/* ============ VERSI DESKTOP (entri.html) — tidak berubah ============ */}
      <div className="hidden md:flex flex-col min-w-0 w-full">
        {/* Top row: Headline & karakter muncul di pojok kanan atas */}
        <div className="flex items-start justify-between relative mb-6">
          {/* Karakter anime muncul di pojok kanan atas, di belakang konten */}
          <div
            className="pointer-events-none select-none absolute right-0 -top-6 w-52 h-40 md:w-72 md:h-56 overflow-hidden flex items-center justify-end opacity-90 z-0"
            data-purpose="character-peek-layer"
          >
            <div className="absolute w-40 h-40 right-4 top-2 rounded-full bg-gradient-to-br from-pink-200/50 via-purple-100/40 to-blue-100/40 blur-2xl" />
            <img
              alt="Karakter Learning Log"
              className="relative w-full h-full object-contain object-top scale-125 translate-y-1 filter drop-shadow-[0_10px_20px_rgba(200,180,220,0.25)]"
              src="/character.png"
            />
          </div>

          {/* Headline dua baris */}
          <div className="relative z-10">
            <h1 className="text-3xl md:text-[34px] font-extrabold tracking-tight leading-[1.2] text-[#111116]">
              <div>Catatan</div>
              <div className="inline-block px-4 py-1 mt-1 rounded-full border border-[#D8D9E0] text-[#111116] bg-transparent">
                belajar kamu
              </div>
            </h1>
            <p className="text-xs text-[#777985] mt-2 font-medium">
              Menampilkan seluruh entri belajar pribadi, diurutkan dari yang terbaru.
            </p>
          </div>
        </div>

        {/* Filter Controls Row (FR-07) */}
        <div className="flex flex-wrap items-center gap-2.5 pb-5 pt-1 border-b border-[#F2F3F8]">
          {/* Chip tag aktif */}
          {filters.tag && (
            <div className="flex items-center gap-1.5 bg-[#080812] text-white text-xs font-semibold px-3.5 py-1.5 rounded-full shadow-sm hover:bg-black transition">
              <span>Tag: {filters.tag}</span>
              <button
                type="button"
                aria-label={`Hapus filter tag ${filters.tag}`}
                onClick={() => onFiltersChange({ ...filters, tag: '' })}
                className="opacity-80 hover:opacity-100"
              >
                <CloseIconMobile />
              </button>
            </div>
          )}

          {!filters.tag && (
            <Dropdown
              fallbackLabel="Tag"
              value={filters.tag}
              options={tagOptions}
              onChange={(v) => onFiltersChange({ ...filters, tag: v })}
            />
          )}
          <Dropdown
            fallbackLabel="Semua status"
            value={filters.status}
            options={statusOptions}
            onChange={(v) => onFiltersChange({ ...filters, status: v })}
          />
          <Dropdown
            fallbackLabel="Rentang tanggal"
            fallbackWhen="all"
            value={filters.range}
            options={rangeOptions}
            onChange={(v) => onFiltersChange({ ...filters, range: v })}
          />
          {hasActiveFilter && (
            <button
              type="button"
              onClick={() => onFiltersChange({ tag: '', status: '', range: 'all' })}
              className="text-xs font-medium text-[#777985] hover:text-[#111116] ml-2 px-2 py-1 transition underline-offset-4 hover:underline"
            >
              Reset filter
            </button>
          )}
        </div>

        {/* Daftar entri: tumpukan kartu horizontal, terbaru di atas */}
        <div className="custom-scroll flex-1 overflow-y-auto pr-2 mt-4 space-y-3.5">
          {filtered.map((e, i) => (
            <Reveal key={e.id} delay={Math.min(i * 60, 300)}>
              <EntryCard entry={e} onEdit={onEdit} onRequestDelete={onRequestDelete} />
            </Reveal>
          ))}
          {filtered.length === 0 && (
            <EmptyState
              emptyAll={entries.length === 0}
              hasFilter={hasActiveFilter || query.trim().length > 0}
              onAdd={onAdd}
              onSearch={onSearch}
              onFiltersChange={onFiltersChange}
            />
          )}
        </div>
      </div>
    </main>
  );
}

/* ---------- Empty state: kosong total vs perlu reset filter ---------- */
function EmptyState({ emptyAll, hasFilter, onAdd, onSearch, onFiltersChange, compact = false }) {
  const cardCls = compact
    ? 'bg-white p-8 shadow-[0_4px_16px_rgba(17,17,22,0.04)] border border-[#F0F1F6]'
    : 'bg-[#F8F8FB] p-10 border border-[#F0F1F6]';

  // Database masih kosong → ajak user menambah entri pertamanya
  if (emptyAll) {
    return (
      <div className={`${cardCls} rounded-[22px] text-center flex flex-col items-center`}>
        <div className="w-12 h-12 rounded-full bg-[#F2F3F8] flex items-center justify-center mb-3 text-[#111116]">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </div>
        <p className="text-sm font-bold text-[#111116]">Belum ada entri belajar</p>
        <p className="text-xs text-[#777985] mt-1 max-w-[320px] leading-relaxed">
          Catat progres belajarmu dengan entri pertama — nanti statistik, tag,
          dan porsi belajar di dashboard ikut terisi otomatis.
        </p>
        {onAdd && (
          <button
            type="button"
            onClick={onAdd}
            className={`mt-4 px-5 py-2.5 rounded-full bg-[#B8F58A] hover:bg-[#a9f074] text-xs font-bold text-[#111116] shadow-sm transition-transform active:scale-95 ${
              compact ? 'w-full' : 'w-auto'
            }`}
          >
            + Tambah Entri
          </button>
        )}
      </div>
    );
  }

  // Punya entri, tapi kata kunci/filter tidak menemukan apa pun
  if (hasFilter) {
    return (
      <div className={`${cardCls} rounded-[22px] text-center flex flex-col items-center`}>
        <div className="w-12 h-12 rounded-full bg-[#F2F3F8] flex items-center justify-center mb-3 text-lg">
          🔍
        </div>
        <p className="text-sm font-bold text-[#111116]">Tidak ada yang cocok</p>
        <p className="text-xs text-[#777985] mt-1 max-w-[320px] leading-relaxed">
          Tidak ada entri untuk kata kunci atau filter ini. Coba ubah pencarian
          atau reset filternya.
        </p>
        <button
          type="button"
          onClick={() => {
            onSearch('');
            onFiltersChange({ tag: '', status: '', range: 'all' });
          }}
          className={`mt-4 px-5 py-2.5 rounded-full bg-white border border-[#D8D9E0] text-xs font-semibold text-[#111116] hover:bg-[#F2F3F8] transition ${
            compact ? 'w-full' : 'w-auto'
          }`}
        >
          Reset pencarian &amp; filter
        </button>
      </div>
    );
  }

  return null;
}

/* ---------- Kartu entri mobile (entriMobile.html) ---------- */
function MobileEntryCard({ entry, onEdit, onRequestDelete }) {
  const e = entry;
  const [showSumber, setShowSumber] = useState(false);

  return (
    <article className="relative flex flex-col w-full rounded-[22px] bg-white p-4 shadow-[0_4px_16px_rgba(17,17,22,0.04)] border border-[#F0F1F6] hover:shadow-md transition-shadow">
      {/* Header row: judul + tanggal · durasi, tag di kanan */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col min-w-0">
          <h2 className="text-sm font-semibold text-[#111116] truncate">{e.judul}</h2>
          <span className="text-xs text-[#777985] mt-0.5">
            {dateLabel(e.tanggal)} · {formatShort(e.durasi)}
          </span>
        </div>
        <div className="shrink-0 flex items-center gap-1 flex-wrap justify-end">
          {e.tags.length === 1 ? (
            <span className="px-2.5 py-0.5 rounded-full bg-[#1B1B25] text-white text-[11px] font-semibold uppercase tracking-wider">
              {e.tags[0]}
            </span>
          ) : (
            e.tags.map((t) => (
              <span key={t} className="px-2.5 py-0.5 rounded-full bg-[#F2F3F8] text-[#111116] text-[11px] font-semibold">
                {t}
              </span>
            ))
          )}
        </div>
      </div>

      {/* Cuplikan catatan */}
      <p className="text-xs text-[#777985] mt-2 line-clamp-2 leading-snug">{e.dipelajari}</p>

      {/* Divider */}
      <div className="w-full h-px bg-[#F2F3F8] my-3" />

      {/* Baris bawah: metadata + aksi */}
      <div className="flex items-center justify-between gap-2 pt-0.5">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status pill */}
          <span className={`inline-flex items-center gap-1 h-6 px-2.5 rounded-full text-[11px] ${mobileStatusClass(e.status)}`}>
            {e.status === 'Selesai' && <CheckIconMobile />}
            {e.status === 'Mau diulang' && <RefreshIcon />}
            <span>{e.status}</span>
          </span>

          {/* Indikator paham n/5 */}
          <div className="inline-flex items-center gap-1.5 bg-[#F2F3F8] px-2 py-1 rounded-full">
            <div aria-label={`Tingkat paham ${e.paham} dari 5`} className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <span key={n} className={`w-1.5 h-1.5 rounded-full ${n <= e.paham ? 'bg-[#1B1B25]' : 'bg-[#C8C5CC]'}`} />
              ))}
            </div>
            <span className="text-[11px] text-[#777985]">Paham {e.paham}/5</span>
          </div>

          {/* Jumlah sumber */}
          {e.sumber.length > 0 && (
            <button
              type="button"
              onClick={() => setShowSumber((v) => !v)}
              aria-expanded={showSumber}
              className="inline-flex items-center gap-0.5 text-[#777985] hover:text-[#111116] transition-colors"
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span className="text-[11px] font-medium">{e.sumber.length} sumber</span>
            </button>
          )}
        </div>

        {/* Tombol aksi: ubah / hapus */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            aria-label={`Ubah entri ${e.judul}`}
            type="button"
            onClick={() => onEdit(e)}
            className="w-7 h-7 rounded-full bg-[#F2F3F8] text-[#777985] hover:text-[#111116] hover:bg-[#E8E9F0] flex items-center justify-center transition-colors active:scale-95"
          >
            <PencilIcon className="w-3.5 h-3.5" />
          </button>
          <button
            aria-label={`Hapus entri ${e.judul}`}
            type="button"
            onClick={() => onRequestDelete(e)}
            className="w-7 h-7 rounded-full bg-[#F2F3F8] text-[#777985] hover:text-[#BA1A1A] hover:bg-[#FFDAD6] flex items-center justify-center transition-colors active:scale-95"
          >
            <TrashIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Baris sumber (muncul saat "N sumber" diklik) */}
      {showSumber && e.sumber.length > 0 && (
        <div className="w-full flex flex-wrap items-center gap-1.5 pt-3 mt-3 border-t border-[#F2F3F8]">
          <span className="text-[11px] font-semibold text-[#777985] mr-1">Sumber belajar:</span>
          {e.sumber.map((s, i) => (
            <a
              key={i}
              href={s}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 bg-[#F8F8FB] border border-[#D8D9E0] text-[11px] font-medium text-[#111116] px-2.5 py-1 rounded-full hover:bg-[#F2F3F8] transition"
            >
              <LinkIcon className="w-3 h-3" />
              <span className="max-w-[180px] truncate">{s.replace(/^https?:\/\//, '')}</span>
            </a>
          ))}
        </div>
      )}
    </article>
  );
}

/* ---------- Kartu entri horizontal desktop (entri.html, tidak berubah) ---------- */
function EntryCard({ entry, onEdit, onRequestDelete }) {
  const e = entry;
  const [showSumber, setShowSumber] = useState(false);

  return (
    <article className="bg-[#F8F8FB] hover:bg-[#F2F3F8] transition-all duration-200 rounded-[22px] p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border border-[#F0F1F6] shadow-sm hover:shadow">
      {/* Kiri: judul + tanggal · durasi */}
      <div className="lg:w-[26%] shrink-0">
        <div className="text-[17px] font-bold text-[#111116] leading-snug">{e.judul}</div>
        <div className="text-xs text-[#777985] font-medium mt-1 flex items-center gap-1.5">
          <span>{dateLabel(e.tanggal)}</span>
          <span className="w-1 h-1 rounded-full bg-[#D8D9E0]" />
          <span className="font-semibold text-[#111116]">{formatShort(e.durasi)}</span>
        </div>
      </div>

      {/* Tengah: cuplikan + tag */}
      <div className="flex-1 lg:px-4 min-w-0 w-full">
        <p className="text-xs text-[#777985] line-clamp-2 leading-relaxed">{e.dipelajari}</p>
        <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
          {e.tags.map((t) => (
            <span
              key={t}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#080812] text-white"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Kanan: status, paham, sumber, aksi */}
      <div className="flex items-center justify-between lg:justify-end gap-3.5 w-full lg:w-auto shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#E8E9F0]">
        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs whitespace-nowrap ${statusClass(e.status)}`}>
          {e.status === 'Mau diulang' && <RefreshIcon />}
          <span className={e.status === 'Sedang dipelajari' ? 'font-semibold' : 'font-medium'}>{e.status}</span>
        </span>

        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <span
                key={n}
                className={`w-2 h-2 rounded-full ${n <= e.paham ? 'bg-[#111116]' : 'bg-[#D8D9E0]'}`}
              />
            ))}
          </div>
          <span className="text-[10px] text-[#777985] font-medium mt-0.5">Paham {e.paham}/5</span>
        </div>

        {e.sumber.length > 0 && (
          <button
            type="button"
            onClick={() => setShowSumber((v) => !v)}
            aria-expanded={showSumber}
            title={showSumber ? 'Sembunyikan sumber' : 'Lihat sumber belajar'}
            className="flex items-center gap-1 text-xs text-[#777985] bg-white px-2.5 py-1 rounded-full border border-[#D8D9E0] hover:text-[#111116] transition"
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span className="font-medium whitespace-nowrap">{e.sumber.length} sumber</span>
          </button>
        )}

        <div className="flex items-center gap-1.5 ml-1">
          <button
            title="Edit entri"
            aria-label={`Ubah entri ${e.judul}`}
            type="button"
            onClick={() => onEdit(e)}
            className="w-8 h-8 rounded-full border border-[#D8D9E0] bg-white hover:bg-[#F2F3F8] text-[#111116] flex items-center justify-center transition"
          >
            <PencilIcon />
          </button>
          <button
            title="Hapus entri"
            aria-label={`Hapus entri ${e.judul}`}
            type="button"
            onClick={() => onRequestDelete(e)}
            className="w-8 h-8 rounded-full border border-[#D8D9E0] bg-white hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 text-[#777985] flex items-center justify-center transition"
          >
            <TrashIcon />
          </button>
        </div>
      </div>

      {/* Baris sumber */}
      {showSumber && e.sumber.length > 0 && (
        <div className="w-full flex flex-wrap items-center gap-1.5 pt-3 border-t border-[#E8E9F0]">
          <span className="text-[11px] font-semibold text-[#777985] mr-1">Sumber belajar:</span>
          {e.sumber.map((s, i) => (
            <a
              key={i}
              href={s}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 bg-white border border-[#D8D9E0] text-[11px] font-medium text-[#111116] px-2.5 py-1 rounded-full hover:bg-[#F2F3F8] transition"
            >
              <LinkIcon className="w-3 h-3" />
              <span className="max-w-[220px] truncate">{s.replace(/^https?:\/\//, '')}</span>
            </a>
          ))}
        </div>
      )}
    </article>
  );
}

/* ---------- Dropdown pill sederhana ---------- */
function Dropdown({ fallbackLabel, fallbackWhen = '', value, options, onChange, compact = false }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (ev) => {
      if (ref.current && !ref.current.contains(ev.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const current = options.find((o) => o.value === value);
  const label = current && current.value !== fallbackWhen ? current.label : fallbackLabel;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={
          compact
            ? 'inline-flex items-center gap-1 h-8 px-3 rounded-full bg-white text-[#111116] text-xs font-medium shadow-[0_2px_6px_rgba(17,17,22,0.03)] active:bg-[#E2E2E2] transition-colors'
            : 'flex items-center gap-2 bg-[#F8F8FB] hover:bg-[#F2F3F8] text-[#111116] text-xs font-medium px-3.5 py-1.5 rounded-full border border-[#D8D9E0] transition'
        }
      >
        <span>{label}</span>
        <svg
          className={`w-3.5 h-3.5 text-[#777985] transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      {open && (
        <div
          role="listbox"
          className="absolute z-30 mt-1.5 w-44 bg-white border border-[#E8E9F0] rounded-2xl shadow-panel p-1.5 custom-scroll max-h-64 overflow-y-auto"
        >
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              role="option"
              aria-selected={o.value === value}
              onClick={(ev) => {
                ev.stopPropagation();
                onChange(o.value);
                setOpen(false);
              }}
              className={`w-full text-left text-xs px-3 py-2 rounded-xl hover:bg-[#F2F3F8] transition ${
                o.value === value ? 'font-bold text-[#111116]' : 'text-[#3D3D46]'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function toISOof(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function CloseIconMobile() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg className="w-3 h-3 text-[#777985]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
      />
    </svg>
  );
}

function CheckIconMobile() {
  return (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function SearchIconMobile() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
      />
    </svg>
  );
}

function TrendIconMobile() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.306L18.75 10m0 0h4.5m-4.5 0v4.5" />
    </svg>
  );
}
