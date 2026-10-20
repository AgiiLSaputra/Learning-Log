// Statistik dashboard (FR-09, FR-10)
import { startOfWeekISO, addDaysISO, toISO } from './date.js';

// Total menit minggu ini (mulai Senin)
export function totalMenitMingguIni(entries, hariIniISO) {
  const mulai = startOfWeekISO(hariIniISO);
  const akhir = addDaysISO(mulai, 6);
  return entries
    .filter((e) => e.tanggal >= mulai && e.tanggal <= akhir)
    .reduce((sum, e) => sum + (e.durasi || 0), 0);
}

// Format "12j 30m" ala Dashboard.html
export function formatDurasi(menit) {
  const j = Math.floor(menit / 60);
  const m = menit % 60;
  if (j === 0) return `${m}m`;
  if (m === 0) return `${j}j`;
  return `${j}j ${m}m`;
}

// Format "8,5j" (desimal koma Indonesia)
export function formatJamDesimal(menit) {
  const j = menit / 60;
  return `${j.toFixed(1).replace('.', ',')}j`;
}

// 5 tag paling sering dipelajari, diukur dari jumlah entri (K-9)
export function topTags(entries, limit = 5) {
  const count = new Map();
  for (const e of entries) {
    for (const t of e.tags || []) {
      count.set(t, (count.get(t) || 0) + 1);
    }
  }
  return Array.from(count.entries())
    .map(([tag, jumlah]) => ({ tag, jumlah }))
    .sort((a, b) => b.jumlah - a.jumlah || a.tag.localeCompare(b.tag))
    .slice(0, limit);
}

// Jumlah hari yang punya minimal satu entri, dalam minggu ini (K-13)
export function hariBelajarMingguIni(entries, hariIniISO) {
  const mulai = startOfWeekISO(hariIniISO);
  const akhir = addDaysISO(mulai, 6);
  const hari = new Set();
  for (const e of entries) {
    if (e.tanggal >= mulai && e.tanggal <= akhir && (e.durasi || 0) > 0) {
      hari.add(e.tanggal);
    }
  }
  return hari.size;
}

// Porsi belajar per tag (FR-10):
// - Porsi dihitung dari total durasi (K-10)
// - Entri multi-tag: durasi dibagi rata antar tag (K-10)
// Hasil: [{ tag, menit }] diurutkan menurun
export function porsiPerTag(entries) {
  const menit = new Map();
  for (const e of entries) {
    const tags = e.tags || [];
    if (tags.length === 0) continue;
    const bagian = (e.durasi || 0) / tags.length;
    for (const t of tags) {
      menit.set(t, (menit.get(t) || 0) + bagian);
    }
  }
  return Array.from(menit.entries())
    .map(([tag, m]) => ({ tag, menit: m }))
    .sort((a, b) => b.menit - a.menit || a.tag.localeCompare(b.tag));
}

// Daftar semua tag unik dari entri
export function allTags(entries) {
  const set = new Set();
  for (const e of entries) for (const t of e.tags || []) set.add(t);
  return Array.from(set).sort((a, b) => a.localeCompare(b, 'id'));
}

// Entri hari ini
export function entriHariIni(entries) {
  const iso = toISO(new Date());
  return entries.filter((e) => e.tanggal === iso);
}
