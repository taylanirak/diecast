/**
 * Cart Store using Zustand
 */

import { create } from 'zustand';
import api from '../services/api';

interface CartItem {
  id: number;
  listing_id: number;
  title: string;
  price: number;
  quantity: number;
  image: string;
  seller: {
    id: number;
    username: string;
  };
}

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
  isLoading: boolean;
  error: string | null;
  
  fetchCart: () => Promise<void>;
  addToCart: (listingId: number, quantity?: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  total: 0,
  itemCount: 0,
  isLoading: false,
  error: null,
  
  fetchCart: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await api.getCart();
      const items = response.items || [];
      const total = items.reduce((sum: number, item: CartItem) => sum + (item.price * item.quantity), 0);
      const itemCount = items.reduce((sum: number, item: CartItem) => sum + item.quantity, 0);
      
      set({ 
        items,
        total,
        itemCount,
        isLoading: false 
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Sepet yüklenemedi',
        isLoading: false,
      });
    }
  },
  
  addToCart: async (listingId: number, quantity = 1) => {
    set({ isLoading: true, error: null });
    
    try {
      await api.addToCart(listingId, quantity);
      await get().fetchCart();
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Sepete eklenemedi',
        isLoading: false,
      });
      throw error;
    }
  },
  
  removeFromCart: async (itemId: number) => {
    set({ isLoading: true, error: null });
    
    try {
      await api.removeFromCart(itemId);
      await get().fetchCart();
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Sepetten kaldırılamadı',
        isLoading: false,
      });
      throw error;
    }
  },
  
  clearCart: () => {
    set({ items: [], total: 0, itemCount: 0 });
  },
}));

export default useCartStore;


