import { create } from 'zustand';

// Shared UI state: the phone menu opens from the header ☰ and from «Каталог» in the bottom bar.
// buyBar: the product page's sticky buy bar replaces the bottom bar while it shows (round 11 #41).
interface Ui { menuOpen: boolean; setMenu: (v: boolean) => void; contactOpen: boolean; setContact: (v: boolean) => void; buyBar: boolean; setBuyBar: (v: boolean) => void }
export const useUi = create<Ui>((set) => ({
  buyBar: false, setBuyBar: (buyBar) => set({ buyBar }),
  menuOpen: false, setMenu: (menuOpen) => set({ menuOpen }),
  contactOpen: false, setContact: (contactOpen) => set({ contactOpen }),
}));
