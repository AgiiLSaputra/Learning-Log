// Util tanggal — minggu dihitung mulai hari Senin (K-9)
const BULAN_PENDEK = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

export function todayISO() {
  return toISO(new Date());
}

export function toISO(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Konversi "yyyy-mm-dd" ke Date lokal (tanpa pergeseran zona waktu).
export function parseISO(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

// Tanggal Senin pada minggu yang sama dengan `iso`
export function startOfWeekISO(iso) {
  const d = parseISO(iso);
  // getDay(): 0 = Minggu, 1 = Senin, ...
  const delta = (d.getDay() + 6) % 7; // Selasa = 1 ... Minggu = 6
  d.setDate(d.getDate() - delta);
  return toISO(d);
}

// Tambah hari
export function addDaysISO(iso, n) {
  const d = parseISO(iso);
  d.setDate(d.getDate() + n);
  return toISO(d);
}

// Rentang teks "19–25 Okt 2026" atau "28 Okt – 2 Nov 2026"
export function rangeLabel(startISO, endISO) {
  const a = parseISO(startISO);
  const b = parseISO(endISO);
  const short = (d) => `${d.getDate()} ${BULAN_PENDEK[d.getMonth()]}`;
  if (a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()) {
    return `${a.getDate()}–${b.getDate()} ${BULAN_PENDEK[b.getMonth()]} ${b.getFullYear()}`;
  }
  return `${short(a)} – ${short(b)} ${b.getFullYear()}`;
}

// Tanggal tampil "19 Okt 2026"
export function dateLabel(iso) {
  const d = parseISO(iso);
  return `${d.getDate()} ${BULAN_PENDEK[d.getMonth()]} ${d.getFullYear()}`;
}

// Bener-oleh 2024 = leap year; fungsi membantu cek ISO valid
export function isValidISO(iso) {
  if (typeof iso !== 'string' || /^\d{4}-\d{2}-\d{2}$/.test(iso) === false) return false;
  const [y, m, d] = iso.split('-').map(Number);
  return (
    y >= 2000 && y <= 2100 && m >= 1 && m <= 12 && d >= 1 && d <= 31 && true
  ) ? isValidDate(y, m, d) : false;
}

function isValidDate(y, m, d) {
  const dt = new Date(y, m - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
}

export { BULAN_PENDEK };
