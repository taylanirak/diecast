'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowRightIcon, 
  SparklesIcon,
  ArrowsRightLeftIcon,
  ShieldCheckIcon,
  TruckIcon 
} from '@heroicons/react/24/outline';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

interface Category {
  id: string;
  name: string;
  slug: string;
  productCount?: number;
  children?: Category[];
}

const DEFAULT_CATEGORIES = [
  { id: 'vintage', name: 'Vintage', icon: '🚗', count: 0 },
  { id: 'sports', name: 'Spor', icon: '🏎️', count: 0 },
  { id: 'muscle', name: 'Muscle', icon: '💪', count: 0 },
  { id: 'trucks', name: 'Kamyon', icon: '🚚', count: 0 },
  { id: 'f1', name: 'F1', icon: '🏁', count: 0 },
  { id: 'custom', name: 'Custom', icon: '🎨', count: 0 },
];

interface FeaturedListing {
  id: string;
  title: string;
  price: number;
  images?: string[];
  brand?: string;
  scale?: string;
  isTradeEnabled?: boolean;
  trade_available?: boolean;
}

const FEATURES = [
  {
    icon: ArrowsRightLeftIcon,
    title: 'Güvenli Takas',
    description: 'Koleksiyonundaki modelleri güvenle diğer koleksiyonerlerle takas et',
    color: 'bg-green-500',
  },
  {
    icon: ShieldCheckIcon,
    title: 'Güvenli Ödeme',
    description: 'PayTR ve Iyzico ile güvenli ödeme seçenekleri',
    color: 'bg-blue-500',
  },
  {
    icon: TruckIcon,
    title: 'Kargo Takibi',
    description: 'Yurtiçi ve Aras Kargo ile entegre kargo takip sistemi',
    color: 'bg-orange-500',
  },
];

export default function Home() {
  const { isAuthenticated } = useAuthStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredListings, setFeaturedListings] = useState<FeaturedListing[]>([]);

  useEffect(() => {
    fetchCategories();
    fetchFeaturedListings();
  }, []);

  const fetchFeaturedListings = async () => {
    try {
      const response = await api.get('/products', { params: { limit: 4 } });
      const products = response.data.data || response.data.products || response.data || [];
      setFeaturedListings(Array.isArray(products) ? products.slice(0, 4) : []);
    } catch (error) {
      console.error('Failed to fetch featured listings:', error);
      setFeaturedListings([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      const cats = response.data.data || response.data || [];
      // Flatten category tree and take first 6
      const flatCategories: Category[] = [];
      const flatten = (cats: Category[]) => {
        cats.forEach(cat => {
          if (flatCategories.length < 6) {
            flatCategories.push(cat);
          }
          if (cat.children && flatCategories.length < 6) {
            flatten(cat.children);
          }
        });
      };
      flatten(cats);
      setCategories(flatCategories.slice(0, 6));
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      // Use default categories if API fails
      setCategories(DEFAULT_CATEGORIES.map(c => ({ id: c.id, name: c.name, slug: c.id, productCount: c.count })));
    }
  };

  const displayCategories = categories.length > 0 ? categories : DEFAULT_CATEGORIES.map(c => ({ id: c.id, name: c.name, slug: c.id, productCount: c.count }));

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-gradient text-white py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6"
            >
              <SparklesIcon className="w-5 h-5 text-yellow-400" />
              <span className="text-sm font-medium">Türkiye'nin #1 Diecast Pazarı</span>
            </motion.div>
            
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Koleksiyonunuzu
              <br />
              <span className="text-primary-400">Büyütün</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Binlerce diecast model arasından aradığınızı bulun. 
              Güvenle alın, satın veya takas yapın.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/listings" 
                className="btn-primary flex items-center justify-center gap-2"
              >
                İlanlara Göz At
                <ArrowRightIcon className="w-5 h-5" />
              </Link>
              {!isAuthenticated && (
                <Link 
                  href="/register" 
                  className="bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
                >
                  Ücretsiz Üye Ol
                </Link>
              )}
              {isAuthenticated && (
                <Link 
                  href="/listings/new" 
                  className="bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
                >
                  İlan Ver
                </Link>
              )}
            </div>
          </motion.div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
      </section>

      {/* Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Kategoriler</h2>
            <p className="text-gray-600">Aradığınız model türünü keşfedin</p>
          </motion.div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {displayCategories.map((category, index) => {
              const defaultCat = DEFAULT_CATEGORIES.find(c => c.id === category.slug || c.name.toLowerCase() === category.name.toLowerCase());
              return (
                <Link
                  key={category.id}
                  href={`/listings?categoryId=${category.id}`}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="card p-6 text-center card-hover cursor-pointer"
                  >
                    <span className="text-4xl mb-3 block">{defaultCat?.icon || '🚗'}</span>
                    <h3 className="font-semibold text-gray-900">{category.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{category.productCount || 0} ilan</p>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">Öne Çıkanlar</h2>
              <p className="text-gray-600">Koleksiyoncuların favorileri</p>
            </div>
            <Link 
              href="/listings" 
              className="text-primary-500 font-semibold hover:text-primary-600 flex items-center gap-1"
            >
              Tümünü Gör
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredListings.length === 0 ? (
              <div className="col-span-full text-center py-8 text-gray-500">
                Ürünler yükleniyor...
              </div>
            ) : (
              featuredListings.map((listing, index) => (
                <Link key={listing.id} href={`/listings/${listing.id}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="card overflow-hidden card-hover cursor-pointer"
                  >
                    <div className="relative aspect-square bg-gray-100">
                      <Image
                        src={listing.images?.[0] || 'https://placehold.co/400x400/f3f4f6/9ca3af?text=Ürün'}
                        alt={listing.title}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/f3f4f6/9ca3af?text=Ürün';
                        }}
                      />
                      {(listing.isTradeEnabled || listing.trade_available) && (
                        <div className="absolute top-3 left-3 badge badge-trade">
                          <ArrowsRightLeftIcon className="w-4 h-4 mr-1" />
                          Takas
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">
                        {listing.title}
                      </h3>
                      <p className="text-sm text-gray-500 mb-2">
                        {listing.brand || 'Marka'} • {listing.scale || '1:64'}
                      </p>
                      <p className="text-xl font-bold text-primary-500">
                        ₺{listing.price.toLocaleString('tr-TR')}
                      </p>
                    </div>
                  </motion.div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Trade Banner */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-green-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Takas Yap, Koleksiyonunu Büyüt!
              </h2>
              <p className="text-green-100 text-lg max-w-xl">
                Güvenli takas sistemimizle diğer koleksiyonerlerle model değişimi yapın. 
                Nakit fark özelliğiyle her iki taraf için de adil takaslar gerçekleştirin.
              </p>
            </div>
            <Link 
              href="/trades" 
              className="bg-white text-green-600 px-8 py-4 rounded-xl font-bold hover:bg-green-50 transition-colors flex items-center gap-2 shrink-0"
            >
              <ArrowsRightLeftIcon className="w-6 h-6" />
              Takas Bölümüne Git
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Neden Biz?</h2>
            <p className="text-gray-600">Koleksiyoncular için tasarlandı</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEATURES.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className={`${feature.color} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Only show for non-authenticated users */}
      {!isAuthenticated && (
        <section className="py-20 bg-gray-900 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                Koleksiyonunuzu Paylaşmaya Hazır mısınız?
              </h2>
              <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
                Hemen ücretsiz üye olun ve binlerce koleksiyonere ulaşın. 
                İlk 5 ilanınız tamamen ücretsiz!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register" className="btn-primary text-lg">
                  Şimdi Üye Ol
                </Link>
                <Link 
                  href="/pricing" 
                  className="text-white border-2 border-white/20 px-6 py-3 rounded-xl font-semibold hover:bg-white/10 transition-colors"
                >
                  Üyelik Planları
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      )}
    </div>
  );
}


