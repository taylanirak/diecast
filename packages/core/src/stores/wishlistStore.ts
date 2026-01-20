import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistState {
  items: string[]; // Product IDs
  isLoading: boolean;
  addItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  toggleItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  setItems: (items: string[]) => void;
  setLoading: (loading: boolean) => void;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,

      addItem: (productId) =>
        set((state) => ({
          items: state.items.includes(productId)
            ? state.items
            : [...state.items, productId],
        })),

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((id) => id !== productId),
        })),

      toggleItem: (productId) => {
        const { items } = get();
        if (items.includes(productId)) {
          get().removeItem(productId);
        } else {
          get().addItem(productId);
        }
      },

      isInWishlist: (productId) => get().items.includes(productId),

      setItems: (items) => set({ items }),

      setLoading: (isLoading) => set({ isLoading }),

      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: 'tarodan-wishlist',
    }
  )
);
