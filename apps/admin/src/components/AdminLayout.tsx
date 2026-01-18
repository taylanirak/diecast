'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';
import clsx from 'clsx';
import {
  HomeIcon,
  UsersIcon,
  ShoppingBagIcon,
  ClipboardDocumentListIcon,
  ArrowsRightLeftIcon,
  ChatBubbleLeftRightIcon,
  TicketIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Kullanıcılar', href: '/users', icon: UsersIcon },
  { name: 'Ürünler', href: '/products', icon: ShoppingBagIcon },
  { name: 'Moderasyon', href: '/moderation', icon: ShieldCheckIcon },
  { name: 'Siparişler', href: '/orders', icon: ClipboardDocumentListIcon },
  { name: 'Takaslar', href: '/trades', icon: ArrowsRightLeftIcon },
  { name: 'Mesajlar', href: '/messages', icon: ChatBubbleLeftRightIcon },
  { name: 'Destek', href: '/support', icon: TicketIcon },
  { name: 'Raporlar', href: '/reports', icon: ChartBarIcon },
  { name: 'Ayarlar', href: '/settings', icon: Cog6ToothIcon },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 w-64 bg-dark-800 border-r border-dark-700 transform transition-transform duration-300 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-dark-700">
          <Link href="/dashboard" className="flex items-center">
            <span className="text-2xl font-bold text-primary-500">TARODAN</span>
            <span className="ml-2 text-xs text-gray-400">Admin</span>
          </Link>
          <button
            className="lg:hidden text-gray-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={clsx(
                  'flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-500/10 text-primary-500'
                    : 'text-gray-400 hover:bg-dark-700 hover:text-white'
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-dark-700">
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center">
              <span className="text-primary-500 font-semibold">
                {user?.displayName?.charAt(0) || 'A'}
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">{user?.displayName}</p>
              <p className="text-xs text-gray-400">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-dark-900/95 backdrop-blur border-b border-dark-700 flex items-center px-4">
          <button
            className="lg:hidden text-gray-400 hover:text-white mr-4"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center space-x-4">
            {/* Notifications bell could go here */}
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
