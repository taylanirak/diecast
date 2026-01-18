'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { PlusIcon, PencilIcon, TrashIcon, CheckIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { addressesApi } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

interface Address {
  id: string;
  title?: string;
  fullName: string;
  phone: string;
  city: string;
  district: string;
  address: string;
  zipCode?: string;
  isDefault: boolean;
}

export default function AddressesPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    fullName: '',
    phone: '',
    city: '',
    district: '',
    address: '',
    zipCode: '',
    isDefault: false,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/profile/addresses');
      return;
    }
    fetchAddresses();
  }, [isAuthenticated]);

  const fetchAddresses = async () => {
    setIsLoading(true);
    try {
      const response = await addressesApi.getAll();
      setAddresses(response.data.data || response.data || []);
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
      toast.error('Adresler yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await addressesApi.update(editingId, formData);
        toast.success('Adres güncellendi');
      } else {
        await addressesApi.create(formData);
        toast.success('Adres eklendi');
      }
      setShowForm(false);
      setEditingId(null);
      resetForm();
      fetchAddresses();
    } catch (error: any) {
      console.error('Failed to save address:', error);
      toast.error(error.response?.data?.message || 'Adres kaydedilemedi');
    }
  };

  const handleEdit = (address: Address) => {
    setFormData({
      title: address.title || '',
      fullName: address.fullName,
      phone: address.phone,
      city: address.city,
      district: address.district,
      address: address.address,
      zipCode: address.zipCode || '',
      isDefault: address.isDefault,
    });
    setEditingId(address.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu adresi silmek istediğinizden emin misiniz?')) {
      return;
    }
    try {
      await addressesApi.delete(id);
      toast.success('Adres silindi');
      fetchAddresses();
    } catch (error: any) {
      console.error('Failed to delete address:', error);
      toast.error('Adres silinemedi');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await addressesApi.setDefault(id);
      toast.success('Varsayılan adres güncellendi');
      fetchAddresses();
    } catch (error: any) {
      console.error('Failed to set default address:', error);
      toast.error('Varsayılan adres ayarlanamadı');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      fullName: '',
      phone: '',
      city: '',
      district: '',
      address: '',
      zipCode: '',
      isDefault: false,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3" />
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Adreslerim</h1>
            <p className="text-gray-600">Teslimat adreslerinizi yönetin</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setEditingId(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600"
          >
            <PlusIcon className="w-5 h-5" />
            Yeni Adres
          </button>
        </div>

        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm p-6 mb-6"
          >
            <h2 className="text-xl font-semibold mb-4">
              {editingId ? 'Adresi Düzenle' : 'Yeni Adres Ekle'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adres Başlığı (Opsiyonel)
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Ev, İş, vb."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ad Soyad <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefon <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    İl <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    İlçe <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adres <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Posta Kodu
                </label>
                <input
                  type="text"
                  value={formData.zipCode}
                  onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="isDefault" className="text-sm text-gray-700">
                  Varsayılan adres olarak ayarla
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                >
                  {editingId ? 'Güncelle' : 'Kaydet'}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {addresses.length === 0 && !showForm ? (
          <div className="text-center py-16 bg-white rounded-xl">
            <p className="text-gray-600 text-lg mb-4">Henüz adres eklenmemiş</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600"
            >
              İlk Adresinizi Ekleyin
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {addresses.map((address) => (
              <motion.div
                key={address.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {address.isDefault && (
                      <span className="inline-block px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded mb-2">
                        Varsayılan
                      </span>
                    )}
                    {address.title && (
                      <h3 className="font-semibold text-lg mb-2">{address.title}</h3>
                    )}
                    <p className="text-gray-900 font-medium">{address.fullName}</p>
                    <p className="text-gray-600">{address.phone}</p>
                    <p className="text-gray-600 mt-2">
                      {address.address}, {address.district}, {address.city}
                      {address.zipCode && ` ${address.zipCode}`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {!address.isDefault && (
                      <button
                        onClick={() => handleSetDefault(address.id)}
                        className="p-2 text-primary-500 hover:bg-primary-50 rounded-lg"
                        title="Varsayılan yap"
                      >
                        <CheckIcon className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(address)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                      title="Düzenle"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(address.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      title="Sil"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
