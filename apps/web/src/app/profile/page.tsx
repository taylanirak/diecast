'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { api } from '@/lib/api';

interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  phone?: string;
  avatarUrl?: string;
  bio?: string;
  isSeller: boolean;
  isVerified: boolean;
  createdAt: string;
  addresses?: any[];
  stats?: {
    productsCount: number;
    ordersCount: number;
    tradesCount: number;
    collectionsCount: number;
    rating: number;
    reviewsCount: number;
  };
  membership?: {
    tier: string;
    expiresAt: string;
  };
}

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadProfile();
  }, [isAuthenticated]);

  const loadProfile = async () => {
    try {
      const [profileResponse, statsResponse] = await Promise.all([
        api.get('/auth/profile'),
        api.get('/users/me/stats').catch(() => null), // Stats endpoint may not exist yet
      ]);
      const profileData = profileResponse.data.user || profileResponse.data;
      const statsData = statsResponse?.data || {};
      
      setProfile({
        ...profileData,
        stats: {
          productsCount: statsData.productsCount || 0,
          ordersCount: statsData.ordersCount || 0,
          tradesCount: statsData.tradesCount || 0,
          collectionsCount: statsData.collectionsCount || 0,
          rating: statsData.rating || 0,
          reviewsCount: statsData.reviewsCount || 0,
        },
      });
    } catch (error) {
      console.error('Profile load error:', error);
      // Fallback to auth profile if user endpoint fails
      try {
        const response = await api.get('/auth/profile');
        const profileData = response.data.user || response.data;
        setProfile({
          ...profileData,
          stats: {
            productsCount: 0,
            ordersCount: 0,
            tradesCount: 0,
            collectionsCount: 0,
            rating: 0,
            reviewsCount: 0,
          },
        });
      } catch (err) {
        console.error('Auth profile load error:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <main className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : profile ? (
          <div className="space-y-8">
            {/* Profile Header */}
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="flex items-start gap-6">
                <div className="w-24 h-24 bg-primary-500/20 rounded-full flex items-center justify-center text-4xl">
                  {profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt={profile.displayName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    profile.displayName.charAt(0)
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold">{profile.displayName}</h1>
                    {profile.isVerified && (
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                        Doğrulanmış
                      </span>
                    )}
                    {profile.membership && (
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                        {profile.membership.tier}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 mt-1">{profile.email}</p>
                  {profile.bio && <p className="text-gray-300 mt-2">{profile.bio}</p>}
                  <p className="text-gray-500 text-sm mt-2">
                    Üye olma: {new Date(profile.createdAt).toLocaleDateString('tr-TR')}
                  </p>
                </div>
                <Link
                  href="/profile/edit"
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Profili Düzenle
                </Link>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'İlanlarım', value: profile.stats?.productsCount ?? 0, href: '/profile/listings' },
                { label: 'Siparişlerim', value: profile.stats?.ordersCount ?? 0, href: '/orders' },
                { label: 'Takaslarım', value: profile.stats?.tradesCount ?? 0, href: '/trades' },
                { label: 'Koleksiyonlarım', value: profile.stats?.collectionsCount ?? 0, href: '/collections' },
              ].map((stat) => (
                <Link
                  key={stat.label}
                  href={stat.href}
                  className="bg-gray-800 rounded-xl p-4 hover:bg-gray-750 transition-colors"
                >
                  <p className="text-3xl font-bold text-primary-400">{stat.value}</p>
                  <p className="text-gray-400">{stat.label}</p>
                </Link>
              ))}
            </div>

            {/* Rating */}
            {profile.stats && profile.stats.rating > 0 && (
              <div className="bg-gray-800 rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4">Değerlendirmelerim</h2>
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-bold text-yellow-400">
                    {profile.stats.rating.toFixed(1)}
                  </div>
                  <div>
                    <div className="flex text-yellow-400">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`w-6 h-6 ${
                            star <= (profile.stats?.rating ?? 0) ? 'fill-current' : 'text-gray-600'
                          }`}
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-gray-400 text-sm">{profile.stats?.reviewsCount ?? 0} değerlendirme</p>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Links */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">Hızlı Erişim</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Mesajlarım', href: '/messages', icon: '💬' },
                  { label: 'Favorilerim', href: '/wishlist', icon: '❤️' },
                  { label: 'Üyelik', href: '/profile/membership', icon: '⭐' },
                  { label: 'Destek', href: '/support', icon: '🎫' },
                  { label: 'Adreslerim', href: '/profile/addresses', icon: '📍' },
                  { label: 'Ayarlar', href: '/profile/settings', icon: '⚙️' },
                ].map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <span className="text-2xl">{link.icon}</span>
                    <span>{link.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors"
            >
              Çıkış Yap
            </button>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400">Profil yüklenemedi</p>
          </div>
        )}
      </main>
    </div>
  );
}
