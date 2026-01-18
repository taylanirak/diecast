'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { HeartIcon, TrashIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import { wishlistApi } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

interface WishlistItem {
  id: string;
  productId: string;
  product: {
    id: string;
    title: string;
    price: number;
    images?: Array<{ url: string } | string>;
    condition?: string;
  };
  addedAt: string;
}

export default function FavoritesPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Favorileri görmek için giriş yapmalısınız');
      router.push('/login?redirect=/favorites');
      return;
    }
    fetchFavorites();
  }, [isAuthenticated]);

  const fetchFavorites = async () => {
    setIsLoading(true);
    try {
      const response = await wishlistApi.get();
      // Handle multiple possible response formats
      const wishlistItems = response.data?.items || response.data?.data || response.data || [];
      
      // Filter out invalid items (those without proper product data)
      const validItems = (Array.isArray(wishlistItems) ? wishlistItems : []).filter(
        (item: any) => item && (item.product || item.productId)
      );
      
      setItems(validItems);
    } catch (error: any) {
      console.error('Failed to fetch favorites:', error);
      // Don't show error toast for 404 (empty wishlist is valid)
      if (error.response?.status !== 404) {
        toast.error('Favoriler yüklenemedi');
      }
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (itemId: string) => {
    try {
      await wishlistApi.remove(itemId);
      toast.success('Favorilerden çıkarıldı');
      fetchFavorites();
    } catch (error: any) {
      console.error('Failed to remove from favorites:', error);
      toast.error('Kaldırılamadı');
    }
  };

  const getImageUrl = (product: WishlistItem['product'] | undefined | null): string => {
    if (!product || !product.images || product.images.length === 0) {
      return 'https://placehold.co/400x400/f3f4f6/9ca3af?text=Ürün';
    }
    const firstImage = product.images[0];
    if (typeof firstImage === 'string') {
      return firstImage;
    }
    return firstImage?.url || 'https://placehold.co/400x400/f3f4f6/9ca3af?text=Ürün';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Favorilerim</h1>
            <p className="text-gray-600">
              {items.length} {items.length === 1 ? 'ürün' : 'ürün'} favorilerinizde
            </p>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl">
            <HeartIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-4">Henüz favori ürününüz yok</p>
            <Link
              href="/listings"
              className="inline-block px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600"
            >
              Ürünlere Göz At
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((item, index) => {
              const productId = item.productId || item.product?.id;
              const product = item.product;
              
              return (
                <motion.div
                  key={item.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <Link href={`/listings/${productId}`}>
                    <div className="relative aspect-square bg-gray-100">
                      <Image
                        src={getImageUrl(product)}
                        alt={product?.title || 'Ürün'}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/f3f4f6/9ca3af?text=Ürün';
                        }}
                      />
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleRemove(item.id || productId);
                        }}
                        className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors z-10"
                      >
                        <TrashIcon className="w-5 h-5 text-red-500" />
                      </button>
                    </div>
                  </Link>
                  <div className="p-4">
                    <Link href={`/listings/${productId}`}>
                      <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 hover:text-primary-500">
                        {product?.title || 'Ürün'}
                      </h3>
                    </Link>
                    <div className="flex items-center justify-between">
                      <p className="text-xl font-bold text-primary-500">
                        ₺{Number(product?.price || 0).toLocaleString('tr-TR')}
                      </p>
                      {product?.condition && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {product.condition}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
