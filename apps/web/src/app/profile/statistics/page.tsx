'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

interface UserStats {
  productsCount: number;
  ordersCount: number;
  tradesCount: number;
  collectionsCount: number;
  rating: number;
  reviewsCount: number;
  totalRevenue?: number;
  totalSpent?: number;
}

export default function StatisticsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadStatistics();
  }, [isAuthenticated]);

  const loadStatistics = async () => {
    try {
      const response = await api.get('/users/me/stats').catch(() => {
        // If stats endpoint doesn't exist, calculate from other endpoints
        return null;
      });

      if (response) {
        setStats(response.data);
      } else {
        // Fallback: fetch data from multiple endpoints
        const [productsRes, ordersRes, tradesRes, collectionsRes] = await Promise.all([
          api.get('/products/my').catch(() => ({ data: { meta: { total: 0 } } })),
          api.get('/orders/my').catch(() => ({ data: { meta: { total: 0 } } })),
          api.get('/trades').catch(() => ({ data: { data: [] } })),
          api.get('/collections/me').catch(() => ({ data: { data: [] } })),
        ]);

        setStats({
          productsCount: productsRes.data.meta?.total || productsRes.data.data?.length || 0,
          ordersCount: ordersRes.data.meta?.total || ordersRes.data.data?.length || 0,
          tradesCount: tradesRes.data.data?.length || tradesRes.data.trades?.length || 0,
          collectionsCount: collectionsRes.data.data?.length || collectionsRes.data.collections?.length || 0,
          rating: 0,
          reviewsCount: 0,
        });
      }
    } catch (error) {
      console.error('Statistics load error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Profile Dön
        </Link>

        <h1 className="text-3xl font-bold mb-8">İstatistiklerim</h1>

        {stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-800 rounded-xl p-6">
              <p className="text-gray-400 mb-2">Toplam İlan</p>
              <p className="text-3xl font-bold text-primary-400">{stats.productsCount}</p>
            </div>

            <div className="bg-gray-800 rounded-xl p-6">
              <p className="text-gray-400 mb-2">Toplam Sipariş</p>
              <p className="text-3xl font-bold text-primary-400">{stats.ordersCount}</p>
            </div>

            <div className="bg-gray-800 rounded-xl p-6">
              <p className="text-gray-400 mb-2">Toplam Takas</p>
              <p className="text-3xl font-bold text-primary-400">{stats.tradesCount}</p>
            </div>

            <div className="bg-gray-800 rounded-xl p-6">
              <p className="text-gray-400 mb-2">Koleksiyonlarım</p>
              <p className="text-3xl font-bold text-primary-400">{stats.collectionsCount}</p>
            </div>

            {stats.rating > 0 && (
              <div className="bg-gray-800 rounded-xl p-6">
                <p className="text-gray-400 mb-2">Ortalama Puan</p>
                <p className="text-3xl font-bold text-yellow-400">{stats.rating.toFixed(1)}</p>
                <p className="text-sm text-gray-500 mt-1">{stats.reviewsCount} değerlendirme</p>
              </div>
            )}

            {stats.totalRevenue !== undefined && (
              <div className="bg-gray-800 rounded-xl p-6">
                <p className="text-gray-400 mb-2">Toplam Gelir</p>
                <p className="text-3xl font-bold text-green-400">
                  ₺{Number(stats.totalRevenue).toLocaleString('tr-TR')}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400">İstatistikler yüklenemedi</p>
          </div>
        )}
      </main>
    </div>
  );
}
