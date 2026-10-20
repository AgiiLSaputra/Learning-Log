// Dialog konfirmasi sebelum entri dihapus (FR-03, K-15)
// Gaya visual mengikuti dialog di hapus.html
import { useEffect, useState } from 'react';
import { TrashIcon } from './icons.jsx';

export default function ConfirmDialog({ open, judul = '', onCancel, onConfirm }) {
  const [menghapus, setMenghapus] = useState(false);

  // Reset state tiap kali dialog dibuka ulang
  useEffect(() => {
    if (open) setMenghapus(false);
  }, [open]);

  if (!open) return null;

  // Efek "Menghapus…" sesuai referensi, lalu entri benar-benar dihapus
  const handleDelete = () => {
    if (menghapus) return;
    setMenghapus(true);
    setTimeout(() => {
      onConfirm();
    }, 400);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/60 backdrop-blur-sm backdrop-enter"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      <div className="w-full max-w-[390px] bg-white rounded-3xl p-7 shadow-2xl shadow-purple-950/10 flex flex-col items-center text-center sheet-enter">
        {/* Lingkaran ikon hapus */}
        <div className="w-12 h-12 rounded-full bg-[#F2F3F8] flex items-center justify-center mb-4 text-[#111116] shadow-sm">
          <TrashIcon className="w-6 h-6" />
        </div>

        {/* Judul */}
        <h2 id="dialog-title" className="text-xl font-bold tracking-tight text-[#111116] mb-2">
          Hapus entri ini?
        </h2>

        {/* Deskripsi */}
        <p className="text-sm leading-relaxed text-[#777985] max-w-[300px] mb-7">
          <span className="font-semibold">“{judul}”</span> akan dihapus dari catatan belajarmu.
        </p>

        {/* Baris tombol: tanpa warna merah, persis referensi */}
        <div className="flex items-center gap-3 w-full">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 px-5 rounded-full bg-white text-[#111116] text-sm font-semibold shadow-sm hover:bg-neutral-100 active:scale-95 transition"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={menghapus}
            className="flex-1 py-2.5 px-5 rounded-full bg-[#080812] text-white text-sm font-semibold shadow-sm hover:opacity-90 active:scale-95 transition"
          >
            {menghapus ? <span className="inline-block animate-pulse">Menghapus…</span> : 'Hapus'}
          </button>
        </div>
      </div>
    </div>
  );
}
