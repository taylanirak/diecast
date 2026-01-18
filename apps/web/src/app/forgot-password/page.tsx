'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { EnvelopeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('E-posta adresi gerekli');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setIsSubmitted(true);
      toast.success('Şifre sıfırlama linki e-postanıza gönderildi');
    } catch (error: any) {
      console.error('Failed to request password reset:', error);
      // Don't show error - security best practice
      setIsSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Giriş Sayfasına Dön
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm p-8"
        >
          {!isSubmitted ? (
            <>
              <h1 className="text-3xl font-bold mb-2">Şifremi Unuttum</h1>
              <p className="text-gray-600 mb-8">
                E-posta adresinize şifre sıfırlama linki göndereceğiz
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-posta
                  </label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ornek@email.com"
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Gönderiliyor...' : 'Şifre Sıfırlama Linki Gönder'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <EnvelopeIcon className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">E-posta Gönderildi</h2>
              <p className="text-gray-600 mb-6">
                Eğer bu e-posta adresi kayıtlıysa, şifre sıfırlama linki gönderilmiştir.
                Lütfen e-postanızı kontrol edin.
              </p>
              <Link
                href="/login"
                className="inline-block px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600"
              >
                Giriş Sayfasına Dön
              </Link>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
