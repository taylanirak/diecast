/**
 * Trades Store using Zustand
 */

import { create } from 'zustand';
import api from '../services/api';

export type TradeStatus = 
  | 'pending'
  | 'accepted' 
  | 'rejected'
  | 'initiator_shipped'
  | 'receiver_shipped'
  | 'initiator_delivered'
  | 'receiver_delivered'
  | 'confirmed'
  | 'cancelled';

interface TradeListing {
  id: number;
  title: string;
  price: number;
  images: string[];
}

interface TradeUser {
  id: number;
  username: string;
  rating: number;
}

interface Trade {
  id: number;
  status: TradeStatus;
  initiator: TradeUser;
  receiver: TradeUser;
  initiator_listings: TradeListing[];
  receiver_listings: TradeListing[];
  cash_amount: number;
  cash_direction: 'none' | 'initiator_to_receiver' | 'receiver_to_initiator';
  initiator_tracking: string | null;
  receiver_tracking: string | null;
  countdown_expires_at: string | null;
  created_at: string;
  updated_at: string;
}

interface CounterOfferData {
  offeredListingIds: string[];
  cashAmount: number;
  cashDirection: 'initiator_to_receiver' | 'receiver_to_initiator';
  message?: string;
}

interface TradesState {
  trades: Trade[];
  currentTrade: Trade | null;
  isLoading: boolean;
  error: string | null;
  
  fetchTrades: (status?: TradeStatus) => Promise<void>;
  fetchTrade: (id: number) => Promise<void>;
  createTrade: (data: any) => Promise<void>;
  acceptTrade: (id: number) => Promise<void>;
  rejectTrade: (id: number, reason?: string) => Promise<void>;
  counterOffer: (id: number, data: CounterOfferData) => Promise<void>;
  shipTrade: (id: number, trackingNumber: string, provider: string) => Promise<void>;
  confirmReceipt: (id: number) => Promise<void>;
}

export const useTradesStore = create<TradesState>((set, get) => ({
  trades: [],
  currentTrade: null,
  isLoading: false,
  error: null,
  
  fetchTrades: async (status?: TradeStatus) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await api.getTrades({ status });
      set({ trades: response.trades, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Takaslar yüklenemedi',
        isLoading: false,
      });
    }
  },
  
  fetchTrade: async (id: number) => {
    set({ isLoading: true, error: null, currentTrade: null });
    
    try {
      const response = await api.getTrade(id);
      set({ currentTrade: response.trade, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Takas yüklenemedi',
        isLoading: false,
      });
    }
  },
  
  createTrade: async (data: any) => {
    set({ isLoading: true, error: null });
    
    try {
      await api.createTrade(data);
      set({ isLoading: false });
      get().fetchTrades();
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Takas teklifi oluşturulamadı',
        isLoading: false,
      });
      throw error;
    }
  },
  
  acceptTrade: async (id: number) => {
    set({ isLoading: true, error: null });
    
    try {
      await api.acceptTrade(id);
      get().fetchTrade(id);
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Takas kabul edilemedi',
        isLoading: false,
      });
      throw error;
    }
  },
  
  rejectTrade: async (id: number, reason?: string) => {
    set({ isLoading: true, error: null });
    
    try {
      await api.rejectTrade(id, reason);
      get().fetchTrade(id);
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Takas reddedilemedi',
        isLoading: false,
      });
      throw error;
    }
  },

  counterOffer: async (id: number, data: CounterOfferData) => {
    set({ isLoading: true, error: null });
    
    try {
      await api.post(`/trades/${id}/counter`, data);
      get().fetchTrade(id);
      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Karşı teklif gönderilemedi',
        isLoading: false,
      });
      throw error;
    }
  },
  
  shipTrade: async (id: number, trackingNumber: string, provider: string) => {
    set({ isLoading: true, error: null });
    
    try {
      await api.shipTrade(id, trackingNumber, provider);
      get().fetchTrade(id);
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Kargo bilgisi gönderilemedi',
        isLoading: false,
      });
      throw error;
    }
  },
  
  confirmReceipt: async (id: number) => {
    set({ isLoading: true, error: null });
    
    try {
      await api.confirmTradeReceipt(id);
      get().fetchTrade(id);
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Teslim alındı onaylanamadı',
        isLoading: false,
      });
      throw error;
    }
  },
}));

export default useTradesStore;


