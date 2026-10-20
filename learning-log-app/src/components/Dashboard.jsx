// Dashboard (FR-09, FR-10) — komposisi mengikuti Dashboard.html
import {
  totalMenitMingguIni,
  topTags,
  hariBelajarMingguIni,
  porsiPerTag,
  formatDurasi,
  formatJamDesimal,
} from '../lib/stats.js';
import { startOfWeekISO, addDaysISO, rangeLabel, toISO } from '../lib/date.js';
import { ArrowUpRightIcon } from './icons.jsx';
import Reveal from './Reveal.jsx';

// Warna isi kapsul bar, dari terkecil (gelap) ke terbesar (pucat) ala referensi
const BAR_COLORS = ['#FFFFFF', '#ECECF2', '#E2E4ED', '#D4D6E2', '#C6C8D8'];

export default function Dashboard({ entries, onGoEntries }) {
  const todayISO = toISO(new Date());
  const mulai = startOfWeekISO(todayISO);
  const akhir = addDaysISO(mulai, 6);

  const menitMinggu = totalMenitMingguIni(entries, todayISO);
  const hariBelajar = hariBelajarMingguIni(entries, todayISO);
  const tags = topTags(entries, 5);
  const porsi = porsiPerTag(entries).slice(0, 5);
  const maxMenit = porsi.length ? Math.max(...porsi.map((p) => p.menit)) : 0;

  return (
    <>
      {/* ===== Versi mobile (Dmobile.html) — tampil di layar sempit ===== */}
      <section className="md:hidden flex flex-col gap-5" data-purpose="mobile-dashboard">
        {/* Headline + karakter muncul dari pojok kanan atas */}
        <Reveal className="relative pt-2 pb-1" data-purpose="headline-and-character">
          <div
            className="absolute -right-3 -top-2 w-36 h-36 pointer-events-none opacity-90 overflow-hidden rounded-full mix-blend-multiply z-0"
            data-purpose="character-peek"
          >
            <img
              alt="Karakter Learning Log"
              className="w-full h-full object-cover object-top scale-150"
              src="/character.png"
            />
          </div>
          <div className="relative z-10 pr-28">
            <h1 className="text-[28px] font-bold text-[#111116] leading-[1.25] tracking-tight flex flex-col items-start gap-1">
              <span>Hari ini</span>
              <span className="inline-block border border-[#D8D9E0] bg-white/70 rounded-full px-3.5 py-0.5 text-[26px]">
                belajar apa
              </span>
              <span className="inline-block border border-[#D8D9E0] bg-white/70 rounded-full px-3.5 py-0.5 text-[26px]">
                kamu?
              </span>
            </h1>
          </div>
        </Reveal>

        {/* Subjudul ringkasan */}
        <Reveal className="flex items-center gap-2 pt-1" delay={80} data-purpose="summary-subheading">
          <span className="font-medium text-[#111116] text-sm">Ringkasan</span>
          <span className="text-xs px-2.5 py-0.5 border border-[#D8D9E0] rounded-full text-[#111116] font-medium bg-white">
            minggu ini
          </span>
          <span className="text-xs text-[#777985] ml-auto">{rangeLabel(mulai, akhir)}</span>
        </Reveal>

        {/* Kartu statistik */}
        <Reveal className="flex flex-col gap-3" delay={160} data-purpose="stat-metrics">
          {/* Jam belajar — lebar penuh */}
          <div className="bg-[#F2F3F8] rounded-[22px] p-4 flex flex-col justify-between" data-purpose="total-hours-card">
            <span className="text-xs text-[#777985] font-medium">Jam belajar</span>
            <div className="text-3xl font-bold text-[#111116] my-1">{formatDurasi(menitMinggu)}</div>
            <span className="text-xs text-[#777985]">minggu ini (mulai Senin)</span>
          </div>
          {/* Total entri & hari belajar — 2 kolom */}
          <div className="grid grid-cols-2 gap-3" data-purpose="metrics-grid">
            <div className="bg-[#F8F8FB] border border-[#D8D9E0]/50 rounded-[20px] p-4 flex flex-col justify-between relative">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#777985] font-medium">Total entri</span>
                <button
                  type="button"
                  onClick={onGoEntries}
                  aria-label="Lihat daftar entri"
                  className="w-7 h-7 rounded-full bg-[#080812] flex items-center justify-center text-white active:scale-95 transition"
                >
                  <ArrowUpRightIcon />
                </button>
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold text-[#111116]">{entries.length}</div>
                <div className="text-xs text-[#777985] mt-0.5">seluruh waktu</div>
              </div>
            </div>
            <div className="bg-[#F8F8FB] border border-[#D8D9E0]/50 rounded-[20px] p-4 flex flex-col justify-between">
              <span className="text-xs text-[#777985] font-medium">Hari belajar</span>
              <div className="mt-2">
                <div className="text-2xl font-bold text-[#111116]">{hariBelajar}</div>
                <div className="text-xs text-[#777985] mt-0.5">hari minggu ini</div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Tag teratas */}
        <Reveal
          className="bg-[#F8F8FB] border border-[#D8D9E0]/50 rounded-[22px] p-4"
          delay={240}
          data-purpose="top-tags-container"
        >
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-[#111116]">Tag</span>
            <span className="inline-block border border-[#D8D9E0] bg-white rounded-full px-2 py-0.5 text-xs font-medium text-[#111116]">
              teratas
            </span>
          </div>
          <p className="text-xs text-[#777985] mt-1 mb-3">Berdasarkan jumlah entri</p>
          <div className="flex flex-wrap gap-2" data-purpose="tag-pills-list">
            {tags.slice(0, 3).map(({ tag, jumlah }) => (
              <span key={tag} className="bg-[#080812] text-white text-xs px-3 py-1.5 rounded-full font-medium tracking-tight">
                {tag} · {jumlah}
              </span>
            ))}
            {tags.slice(3).map(({ tag, jumlah }) => (
              <span
                key={tag}
                className="bg-white border border-[#D8D9E0] text-[#111116] text-xs px-3 py-1.5 rounded-full font-medium tracking-tight"
              >
                {tag} · {jumlah}
              </span>
            ))}
            {tags.length === 0 && <span className="text-xs text-[#777985] font-medium">Belum ada tag.</span>}
          </div>
        </Reveal>

        {/* Porsi belajar per tag */}
        <Reveal className="bg-[#F2F3F8] rounded-[22px] p-4" delay={320} data-purpose="tag-duration-bars">
          <h2 className="font-semibold text-sm text-[#111116]">Porsi belajar per tag</h2>
          <p className="text-xs text-[#777985] mb-3">Total durasi (jam)</p>
          <div className="flex flex-col gap-2.5" data-purpose="progress-bar-list">
            {porsi.map((p) => (
              <div key={p.tag} className="flex items-center gap-3">
                <div
                  className="flex-1 bg-white/70 h-2.5 rounded-full overflow-hidden"
                  role="img"
                  aria-label={`${p.tag} ${formatJamDesimal(p.menit)}`}
                >
                  <div
                    className="bg-[#080812] h-full rounded-full transition-all duration-500"
                    style={{ width: `${maxMenit ? Math.round((p.menit / maxMenit) * 100) : 0}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-[#111116] w-20 text-right whitespace-nowrap">
                  {p.tag} {formatJamDesimal(p.menit)}
                </span>
              </div>
            ))}
            {porsi.length === 0 && <p className="text-xs text-[#777985] font-medium">Belum ada durasi tercatat.</p>}
          </div>
        </Reveal>
      </section>

      {/* ===== Versi desktop — tampil di layar lebar ===== */}
      {/* Top Row: Headline kiri, Tag teratas kanan */}
      <div className="hidden md:flex flex-col md:flex-row justify-between items-start z-10 gap-5">
        {/* Headline */}
        <div className="pt-3 max-w-md" data-purpose="daily-headline">
          <h1 className="text-3xl md:text-[38px] leading-[1.25] font-bold text-charcoal tracking-tight">
            <div>Hari ini</div>
            <div className="my-1.5">
              <span className="pill-outline px-4 py-0.5 text-3xl md:text-[35px] font-bold text-charcoal bg-white/70 shadow-xs">
                belajar apa
              </span>
            </div>
            <div>
              <span className="pill-outline px-5 py-0.5 text-3xl md:text-[35px] font-bold text-charcoal bg-white/70 shadow-xs">
                kamu?
              </span>
            </div>
          </h1>
        </div>

        {/* Kartu Tag teratas (FR-09) */}
        <div
          className="w-full md:w-80 bg-cardBg rounded-[24px] p-5 shadow-xs border border-gray-100/60 z-10"
          data-purpose="top-tags-card"
        >
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-charcoal">Tag</span>
            <span className="border border-pillborder text-charcoal font-semibold rounded-full px-3 py-0.5 text-xs bg-white">
              teratas
            </span>
          </div>
          <p className="text-xs text-muted mt-1 font-medium">Berdasarkan jumlah entri</p>
          <div className="flex flex-wrap gap-2 mt-4">
            {tags.slice(0, 3).map(({ tag, jumlah }) => (
              <span
                key={tag}
                className="bg-onyx text-white text-xs font-semibold px-3.5 py-1.5 rounded-full flex items-center shadow-xs"
              >
                {tag} · {jumlah}
              </span>
            ))}
            {tags.length === 0 && (
              <span className="text-xs text-muted font-medium">Belum ada tag — tambah entri pertamamu.</span>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.slice(3).map(({ tag, jumlah }) => (
              <span
                key={tag}
                className="bg-white border border-pillborder text-charcoal text-xs font-semibold px-3.5 py-1.5 rounded-full hover:bg-gray-50 transition-colors"
              >
                {tag} · {jumlah}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Ilustrasi karakter tengah — aset Character.png, sedikit digeser */}
      <div
        className="hidden md:flex absolute inset-0 pointer-events-none items-center justify-center z-0 overflow-hidden"
        data-purpose="character-focal-layer"
      >
        <div className="relative w-[500px] h-[570px] -top-4 -left-14 flex items-center justify-center opacity-95">
          <img
            alt="Karakter Learning Log"
            className="w-full h-full object-contain filter select-none pointer-events-none"
            src="/character.png"
          />
          <div className="absolute w-72 h-72 rounded-full bg-gradient-to-tr from-pink-200/40 via-purple-100/30 to-blue-200/40 -z-10 blur-2xl" />
        </div>
      </div>

      {/* Bottom Row: Ringkasan (FR-09) & Porsi belajar per tag (FR-10) */}
      <div className="hidden md:flex relative z-10 flex-col lg:flex-row items-end justify-between gap-5 mt-10 md:mt-14">
        <div className="flex-1 w-full max-w-3xl" data-purpose="summary-stats-section">
          {/* Header ringkasan */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-bold text-charcoal">Ringkasan</span>
            <span className="border border-pillborder rounded-full px-2.5 py-0.5 text-xs text-charcoal font-semibold bg-white/80">
              minggu ini
            </span>
            <span className="text-xs text-muted ml-1 font-medium">{rangeLabel(mulai, akhir)}</span>
          </div>
          {/* 3 kartu statistik */}
          <div className="grid grid-cols-3 gap-3.5">
            {/* Jam belajar minggu ini (Senin) */}
            <div className="glass-card-subtle rounded-2xl p-4 min-h-[115px] flex flex-col justify-between shadow-glassCard border border-white hover:translate-y-[-2px] transition-transform duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted font-medium">Jam belajar</span>
              </div>
              <div className="my-1">
                <div className="text-2xl font-extrabold text-charcoal tracking-tight font-sans">
                  {formatDurasi(menitMinggu)}
                </div>
              </div>
              <div className="text-[11px] text-muted font-medium">minggu ini (mulai Senin)</div>
            </div>
            {/* Total entri seluruh waktu */}
            <div className="glass-card-subtle rounded-2xl p-4 min-h-[115px] flex flex-col justify-between shadow-glassCard border border-white hover:translate-y-[-2px] transition-transform duration-200 relative">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted font-medium">Total entri</span>
                <button
                  type="button"
                  onClick={onGoEntries}
                  aria-label="Lihat daftar entri"
                  title="Lihat daftar entri"
                  className="w-6 h-6 rounded-full bg-onyx text-white flex items-center justify-center hover:opacity-85 transition"
                >
                  <ArrowUpRightIcon />
                </button>
              </div>
              <div className="my-1">
                <div className="text-3xl font-extrabold text-charcoal tracking-tight font-sans">{entries.length}</div>
              </div>
              <div className="text-[11px] text-muted font-medium">seluruh waktu</div>
            </div>
            {/* Hari belajar minggu ini — bukan streak (K-13) */}
            <div className="glass-card-subtle rounded-2xl p-4 min-h-[115px] flex flex-col justify-between shadow-glassCard border border-white hover:translate-y-[-2px] transition-transform duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted font-medium">Hari belajar</span>
              </div>
              <div className="my-1">
                <div className="text-3xl font-extrabold text-charcoal tracking-tight font-sans">{hariBelajar}</div>
              </div>
              <div className="text-[11px] text-muted font-medium">hari minggu ini</div>
            </div>
          </div>
        </div>

        {/* Kartu porsi belajar per tag — bar chart kapsul (FR-10, K-10) */}
        <div
          className="w-full lg:w-72 bg-cardBgAlt rounded-2xl p-4 shadow-sm border border-gray-100/70"
          data-purpose="distribution-card"
        >
          <div className="mb-3">
            <h3 className="text-sm font-bold text-charcoal">Porsi belajar per tag</h3>
            <p className="text-xs text-muted font-medium">Total durasi (jam)</p>
          </div>
          <div className="space-y-2.5">
            {porsi.map((p, i) => (
              <div key={p.tag} className="flex items-center justify-between text-xs">
                <div
                  className="flex-1 mr-3 h-3 bg-onyx rounded-full p-[2px] flex items-center"
                  role="img"
                  aria-label={`${p.tag} ${formatJamDesimal(p.menit)}`}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${maxMenit ? Math.max(6, Math.round((p.menit / maxMenit) * 100)) : 0}%`,
                      background: i === 0 ? '#FFFFFF' : BAR_COLORS[i % BAR_COLORS.length],
                    }}
                  />
                </div>
                <span className="text-[11px] font-bold text-charcoal w-16 text-right whitespace-nowrap">
                  {p.tag} {formatJamDesimal(p.menit)}
                </span>
              </div>
            ))}
            {porsi.length === 0 && (
              <p className="text-xs text-muted font-medium">Belum ada durasi tercatat minggu ini.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
