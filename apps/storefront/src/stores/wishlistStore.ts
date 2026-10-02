import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Wishlist lives in this browser only (round 9 part 3 #25: `localStorage`, no accounts, ever).
// Only slugs are kept; the wishlist page re-reads the products so names and prices are current.
interface Wishlist { slugs: string[]; toggle: (slug: string) => void; has: (slug: string) => boolean }

export const useWishlist = create<Wishlist>()(
  persist(
    (set, get) => ({
      slugs: [],
      toggle: (slug) => set({ slugs: get().slugs.includes(slug) ? get().slugs.filter((s) => s !== slug) : [slug, ...get().slugs].slice(0, 60) }),
      has: (slug) => get().slugs.includes(slug),
    }),
    // Rehydrated after mount (locale layout), so server and first client render agree.
    { name: 'vk_wishlist', version: 1, skipHydration: true, partialize: (s) => ({ slugs: s.slugs }) },
  ),
);
