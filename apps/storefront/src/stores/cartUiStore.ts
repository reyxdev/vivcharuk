import { create } from 'zustand';

// Drawer visibility is client state; cart contents live in the query cache (28 §28.3).
interface CartUi { open: boolean; setOpen: (v: boolean) => void }
export const useCartUiStore = create<CartUi>((set) => ({ open: false, setOpen: (open) => set({ open }) }));
