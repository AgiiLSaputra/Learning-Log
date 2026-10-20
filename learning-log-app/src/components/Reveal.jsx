// Reveal: elemen muncul (fade + naik) saat masuk viewport / discroll oleh pengguna
// Menggunakan IntersectionObserver tanpa library; sekali muncul lalu tidak bersembunyi lagi.
import { useEffect, useRef, useState } from 'react';

export default function Reveal({ children, className = '', delay = 0, ...rest }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    // Fallback bila IntersectionObserver tidak tersedia: langsung tampil
    if (typeof IntersectionObserver === 'undefined') {
      setShown(true);
      return undefined;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShown(true);
            obs.disconnect();
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={`reveal ${shown ? 'reveal-visible' : ''} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
