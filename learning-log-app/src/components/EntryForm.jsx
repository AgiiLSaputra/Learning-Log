// Form tambah / ubah entri (FR-01, FR-02, FR-04, FR-05)
// Desktop: modal tengah ala Tambah.html · Mobile: bottom sheet ala TambahMobile.html
// Trigger tetap dari tombol milik aplikasi: CTA "Tambah Entri" & tombol + di navigasi bawah
import { useEffect, useMemo, useState } from 'react';
import { todayISO } from '../lib/date.js';
import { allTags } from '../lib/stats.js';
import { CloseIcon } from './icons.jsx';

const STATUS_LIST = ['Sedang dipelajari', 'Selesai', 'Mau diulang'];

function kosong() {
  return {
    judul: '',
    tanggal: todayISO(),
    jam: 0,
    menit: 30,
    sumber: [''],
    status: 'Sedang dipelajari',
    paham: 3,
    dipelajari: '',
    bingung: '',
    tags: [],
  };
}

function dariEntri(e) {
  return {
    judul: e.judul,
    tanggal: e.tanggal,
    jam: Math.floor((e.durasi || 0) / 60),
    menit: (e.durasi || 0) % 60,
    sumber: e.sumber && e.sumber.length ? e.sumber : [''],
    status: e.status,
    paham: e.paham,
    dipelajari: e.dipelajari,
    bingung: e.bingung,
    tags: e.tags || [],
  };
}

export default function EntryForm({ open, initial, entries = [], onClose, onSubmit }) {
  const isEdit = Boolean(initial?.id);
  const [form, setForm] = useState(isEdit ? dariEntri(initial) : kosong());
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm(initial?.id ? dariEntri(initial) : kosong());
      setTagInput('');
      setErrors({});
    }
  }, [open, initial]);

  // CATATAN: seluruh hook dipanggil sebelum early-return agar tidak melanggar aturan React
  const saranTags = useMemo(
    () => (open ? allTags(entries).filter((t) => !form.tags.includes(t)).slice(0, 6) : []),
    [open, entries, form.tags],
  );

  if (!open) return null;

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const addTag = (teksDariLuar) => {
    const t = (teksDariLuar ?? tagInput).trim();
    if (!t) return;
    if (form.tags.some((x) => x.toLowerCase() === t.toLowerCase())) {
      setTagInput('');
      return;
    }
    set('tags', [...form.tags, t]);
    setTagInput('');
  };

  const validate = () => {
    const e = {};
    if (!form.judul.trim()) e.judul = 'Judul wajib diisi.';
    if (!form.tanggal) e.tanggal = 'Tanggal wajib diisi.';
    const durasi = (Number(form.jam) || 0) * 60 + (Number(form.menit) || 0);
    if (durasi <= 0) e.durasi = 'Durasi harus lebih dari 0 menit.';
    if (!form.dipelajari.trim()) e.dipelajari = 'Wajib diisi.';
    if (form.tags.length === 0) e.tags = 'Minimal satu tag.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    const durasi = (Number(form.jam) || 0) * 60 + (Number(form.menit) || 0);
    const sumber = form.sumber.map((s) => s.trim()).filter(Boolean);
    onSubmit({
      judul: form.judul.trim(),
      tanggal: form.tanggal,
      durasi,
      sumber,
      status: form.status,
      paham: Number(form.paham),
      dipelajari: form.dipelajari.trim(),
      bingung: form.bingung.trim(),
      tags: form.tags,
    });
  };

  const inputCls = (hasError) =>
    `bg-[#F2F3F8] rounded-2xl px-3.5 py-2.5 w-full text-sm text-[#111116] font-medium placeholder-[#777985] outline-none transition border ${
      hasError ? 'border-rose-300' : 'border-transparent focus:ring-1 focus:ring-[#111116]'
    }`;
  const Err = ({ k }) =>
    errors[k] ? <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors[k]}</p> : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:p-4 bg-white/45 backdrop-blur-[3px] backdrop-enter"
      role="dialog"
      aria-modal="true"
      aria-label={isEdit ? 'Ubah entri' : 'Tambah entri'}
    >
      {/* Mobile: bottom sheet 88% tinggi · Desktop: modal tengah maks 720px */}
      <form
        noValidate
        onSubmit={handleSubmit}
        className="w-full h-[88vh] max-h-[92vh] md:h-auto md:max-h-[88vh] md:max-w-[720px] bg-white rounded-t-[28px] md:rounded-[28px] border-t md:border md:border-[#D8D9E0]/50 shadow-[0_-12px_32px_rgba(17,17,22,0.08)] md:shadow-[0_25px_60px_-15px_rgba(20,20,35,0.15)] overflow-hidden flex flex-col sheet-enter"
      >
        {/* Drag handle — hanya mobile */}
        <div className="w-full pt-3 pb-1 flex justify-center shrink-0 md:hidden">
          <div className="w-10 h-1 bg-[#D8D9E0] rounded-full" />
        </div>

        {/* Header: "Tambah ▪Entri" / "Ubah ▪Entri" */}
        <header className="px-5 md:px-8 py-2.5 md:py-4 flex items-center justify-between shrink-0 border-b border-[#F2F3F8]">
          <h2 className="text-lg md:text-2xl font-bold text-[#111116] tracking-tight flex items-center gap-1.5">
            <span>{isEdit ? 'Ubah' : 'Tambah'}</span>
            <span className="px-2 md:px-3.5 py-0.5 border border-[#D8D9E0] rounded-full text-xs md:text-lg font-bold">
              Entri
            </span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup form"
            className="w-8 md:w-9 h-8 md:h-9 rounded-full bg-[#F2F3F8] hover:bg-[#E4E6ED] flex items-center justify-center text-[#111116] transition-colors"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </header>

        {/* Scrollable form body (fields sama seperti Tambah.html) */}
        <div className="flex-1 overflow-y-auto px-5 md:px-8 py-4 md:py-6 space-y-4 md:space-y-5 custom-scroll">
          {/* Judul */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#111116]">
              Judul <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={form.judul}
              onChange={(e) => set('judul', e.target.value)}
              placeholder="Contoh: Anatomi Design"
              className={inputCls(errors.judul)}
            />
            <Err k="judul" />
          </div>

          {/* Tanggal */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#111116]">
              Tanggal <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={form.tanggal}
              onChange={(e) => set('tanggal', e.target.value)}
              className={`[color-scheme:light] ${inputCls(errors.tanggal)}`}
            />
            <p className="text-[11px] text-[#777985] pl-1">Otomatis hari ini, bisa diubah</p>
            <Err k="tanggal" />
          </div>

          {/* Durasi: Jam & Menit */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#111116]">
              Durasi <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <div
                className={`bg-[#F2F3F8] rounded-2xl px-3 py-2 flex items-center justify-between border transition ${
                  errors.durasi ? 'border-rose-300' : 'border-transparent focus-within:ring-1 focus-within:ring-[#111116]'
                }`}
              >
                <span className="text-xs font-medium text-[#777985]">Jam</span>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={form.jam}
                  onChange={(e) => set('jam', e.target.value)}
                  aria-label="Durasi jam"
                  className="w-14 text-right bg-transparent outline-none text-sm font-semibold text-[#111116] placeholder-[#777985]"
                  placeholder="0"
                />
              </div>
              <div
                className={`bg-[#F2F3F8] rounded-2xl px-3 py-2 flex items-center justify-between border transition ${
                  errors.durasi ? 'border-rose-300' : 'border-transparent focus-within:ring-1 focus-within:ring-[#111116]'
                }`}
              >
                <span className="text-xs font-medium text-[#777985]">Menit</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  step="5"
                  value={form.menit}
                  onChange={(e) => set('menit', e.target.value)}
                  aria-label="Durasi menit"
                  className="w-14 text-right bg-transparent outline-none text-sm font-semibold text-[#111116] placeholder-[#777985]"
                  placeholder="0"
                />
              </div>
            </div>
            <Err k="durasi" />
          </div>

          {/* Tag: chips + input + saran */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#111116]">
              Tag <span className="text-rose-500">*</span>
            </label>
            <div
              className={`bg-[#F2F3F8] rounded-2xl p-2.5 flex flex-wrap items-center gap-1.5 transition ${
                errors.tags ? 'border border-rose-300' : 'border border-transparent focus-within:ring-1 focus-within:ring-[#111116]'
              }`}
            >
              {form.tags.map((t) => (
                <span
                  key={t}
                  className="bg-[#080812] text-white text-[11px] font-medium px-3 py-1 rounded-full flex items-center gap-1.5"
                >
                  {t}
                  <button
                    type="button"
                    aria-label={`Hapus tag ${t}`}
                    onClick={() => set('tags', form.tags.filter((x) => x !== t))}
                    className="text-white/80 hover:text-white leading-none"
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
                onBlur={() => addTag()}
                placeholder="Ketik tag lalu Enter"
                className="bg-transparent outline-none text-xs text-[#111116] placeholder-[#777985] p-1 flex-1 min-w-[110px] font-medium"
              />
            </div>
            {saranTags.length > 0 && (
              <div className="flex items-center gap-1.5 text-[#777985] pt-0.5 flex-wrap">
                <span className="text-[11px]">Saran tag:</span>
                {saranTags.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => addTag(t)}
                    className="px-2.5 py-0.5 rounded-full border border-[#D8D9E0] text-[11px] font-medium text-[#111116] hover:bg-white transition-colors"
                  >
                    + {t}
                  </button>
                ))}
              </div>
            )}
            <Err k="tags" />
          </div>

          {/* Status: pilihan segmen */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#111116]">
              Status <span className="text-rose-500">*</span>
            </label>
            <div className="flex gap-1.5 bg-[#F2F3F8] p-1 rounded-full w-full md:w-fit">
              {STATUS_LIST.map((s) => (
                <button
                  key={s}
                  type="button"
                  aria-pressed={form.status === s}
                  onClick={() => set('status', s)}
                  className={`flex-1 md:flex-none md:px-4 px-2 py-1.5 rounded-full text-xs text-center transition-colors ${
                    form.status === s
                      ? 'bg-[#080812] text-white font-semibold shadow-sm'
                      : 'text-[#777985] font-medium hover:text-[#111116]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Tingkat paham 1-5 */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#111116]">
              Tingkat paham <span className="text-rose-500">*</span>
            </label>
            <div className="flex justify-between items-center px-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-label={`Paham ${n} dari 5`}
                  aria-pressed={form.paham === n}
                  onClick={() => set('paham', n)}
                  className={`w-9 h-9 rounded-full text-xs flex items-center justify-center transition-colors ${
                    (Number(form.paham) || 0) >= n
                      ? 'bg-[#080812] text-white font-bold shadow-sm'
                      : 'bg-[#F2F3F8] text-[#111116] font-bold hover:bg-[#E4E6ED]'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-[#777985] text-center pt-0.5">
              Skala 1 (belum paham) sampai 5 (sangat paham)
            </p>
          </div>

          {/* Apa yang dipelajari */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#111116]">
              Apa yang dipelajari <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={form.dipelajari}
              onChange={(e) => set('dipelajari', e.target.value)}
              placeholder="Tulis ringkasan poin-poin utama materi yang dipelajari..."
              className={`${inputCls(errors.dipelajari)} resize-none`}
            />
            <Err k="dipelajari" />
          </div>

          {/* Apa yang masih bingung (opsional) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#111116]">
              Apa yang masih bingung <span className="font-normal text-[#777985]">(opsional)</span>
            </label>
            <textarea
              rows={2}
              value={form.bingung}
              onChange={(e) => set('bingung', e.target.value)}
              placeholder="Hal atau konsep yang belum dipahami atau ingin diulang..."
              className={`${inputCls(false)} resize-none`}
            />
          </div>

          {/* Sumber belajar (opsional, boleh lebih dari satu — K-5) */}
          <div className="space-y-2 pb-2">
            <label className="block text-xs font-bold text-[#111116]">
              Sumber belajar <span className="font-normal text-[#777985]">(opsional)</span>
            </label>
            <div className="space-y-2">
              {form.sumber.map((s, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-[#F2F3F8] rounded-2xl px-3 py-2 text-xs"
                >
                  <div className="flex items-center gap-2 overflow-hidden mr-2 min-w-0 flex-1">
                    <LinkIconForm />
                    <input
                      type="url"
                      value={s}
                      onChange={(e) => set('sumber', form.sumber.map((x, j) => (j === i ? e.target.value : x)))}
                      placeholder="https://youtube.com/watch?v=…"
                      className="flex-1 bg-transparent outline-none text-[#111116] font-medium placeholder-[#777985] min-w-0"
                    />
                  </div>
                  {form.sumber.length > 1 && (
                    <button
                      type="button"
                      aria-label={`Hapus sumber ${i + 1}`}
                      onClick={() => set('sumber', form.sumber.filter((_, j) => j !== i))}
                      className="w-5 h-5 rounded-full bg-white text-[#777985] hover:text-[#111116] flex items-center justify-center text-xs flex-shrink-0 shadow-sm cursor-pointer"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => set('sumber', [...form.sumber, ''])}
              className="w-full py-2 border border-dashed border-[#D8D9E0] rounded-2xl text-xs font-semibold text-[#111116] hover:bg-[#F2F3F8] transition-colors flex items-center justify-center gap-1"
            >
              <span>+</span> Tambah link
            </button>
          </div>
        </div>

        {/* Footer lengket: keterangan wajib + aksi */}
        <footer className="px-4 md:px-8 py-3 md:py-5 border-t border-[#D8D9E0]/60 bg-white flex items-center justify-between shrink-0">
          <span className="text-xs text-[#777985]">* wajib diisi</span>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 md:px-5 py-2.5 rounded-full border border-[#D8D9E0] text-xs font-semibold text-[#111116] hover:bg-[#F2F3F8] transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 md:px-6 py-2.5 rounded-full bg-[#B8F58A] hover:bg-[#a9f074] text-xs font-bold text-[#111116] shadow-sm transition-transform active:scale-95"
            >
              Simpan
            </button>
          </div>
        </footer>
      </form>
    </div>
  );
}

function LinkIconForm() {
  return (
    <svg
      className="w-3.5 h-3.5 text-[#777985] shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path
        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
