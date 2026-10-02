import { useEffect, useState } from 'react';
import { useWishlist } from '@/stores/wishlistStore';

/** Round 11 #17: the heart is always visible. The pressed state appears only after hydration. */
export function WishHeart({ slug, name, className = '', size = 'size-5' }: { slug: string; name: string; className?: string; size?: string }) {
  const on = useWishlist((s) => s.slugs.includes(slug));
  const toggle = useWishlist((s) => s.toggle);
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const pressed = ready && on;
  const [pulse, setPulse] = useState(0);
  return (
    <button type="button" aria-pressed={pressed} aria-label={pressed ? `Прибрати «${name}» з обраного` : `Додати «${name}» в обране`}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (!on) setPulse((n) => n + 1); toggle(slug); }}
      className={`grid place-items-center rounded-full bg-bg-surface/90 p-2 text-text-primary shadow-sm transition-transform active:scale-90 ${className}`}>
      <svg key={pulse} className={`${size} ${pulse ? 'vk-pulse' : ''} transition-[fill] duration-(--dur-fast)`} viewBox="0 0 24 24" fill={pressed ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M12 20s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.5-7 10-7 10z" /></svg>
    </button>
  );
}
