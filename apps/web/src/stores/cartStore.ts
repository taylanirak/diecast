import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  id: string;
  productId: string;
  title: string;
  price: number;
  quantity: number;
  imageUrl: string;
  seller: {
    id: string;
    displayName: string;
  };
}

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
  isLoading: boolean;
  
  fetchCart: () => Promise<void>;
  addToCart: (item: Omit<CartItem, 'id' | 'quantity'>) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => Promise<void>;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      itemCount: 0,
      isLoading: false,
      
      fetchCart: async () => {
        // Cart is stored locally, no API call needed
        const items = get().items;
        const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
        set({ total, itemCount });
      },
      
      addToCart: async (item) => {
        const items = get().items;
        const existingIndex = items.findIndex(i => i.productId === item.productId);
        
        let newItems: CartItem[];
        if (existingIndex >= 0) {
          // Increase quantity
          newItems = items.map((i, idx) => 
            idx === existingIndex ? { ...i, quantity: i.quantity + 1 } : i
          );
        } else {
          // Add new item
          const newItem: CartItem = {
            ...item,
            id: `cart-${Date.now()}`,
            quantity: 1,
          };
          newItems = [...items, newItem];
        }
        
        const total = newItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);
        const itemCount = newItems.reduce((sum, i) => sum + i.quantity, 0);
        
        set({ items: newItems, total, itemCount });
      },
      
      removeFromCart: async (itemId) => {
        const newItems = get().items.filter(i => i.id !== itemId);
        const total = newItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);
        const itemCount = newItems.reduce((sum, i) => sum + i.quantity, 0);
        
        set({ items: newItems, total, itemCount });
      },
      
      updateQuantity: (itemId, quantity) => {
        if (quantity < 1) return;
        
        const newItems = get().items.map(i => 
          i.id === itemId ? { ...i, quantity } : i
        );
        const total = newItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);
        const itemCount = newItems.reduce((sum, i) => sum + i.quantity, 0);
        
        set({ items: newItems, total, itemCount });
      },
      
      clearCart: async () => {
        set({ items: [], total: 0, itemCount: 0 });
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);

export default useCartStore;
