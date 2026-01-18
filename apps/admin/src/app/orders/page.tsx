'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { adminApi } from '@/lib/api';
import { MagnifyingGlassIcon, EyeIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  commission: number;
  buyer: { displayName: string };
  seller: { displayName: string };
  createdAt: string;
  itemCount: number;
}

const statusOptions = [
  { value: 'all', label: 'Tümü' },
  { value: 'pending_payment', label: 'Ödeme Bekliyor' },
  { value: 'paid', label: 'Ödendi' },
  { value: 'preparing', label: 'Hazırlanıyor' },
  { value: 'shipped', label: 'Kargoda' },
  { value: 'delivered', label: 'Teslim Edildi' },
  { value: 'completed', label: 'Tamamlandı' },
  { value: 'cancelled', label: 'İptal' },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadOrders();
  }, [page, status]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getOrders({
        page,
        limit: 20,
        status: status === 'all' ? undefined : status,
        search: search || undefined,
      });
      const data = response.data.data || response.data.orders || [];
      const meta = response.data.meta || {};
      setOrders(data.map((o: any) => ({
        id: o.id,
        orderNumber: o.orderNumber || `ORD-${o.id.slice(0, 8)}`,
        status: o.status,
        totalAmount: Number(o.totalAmount || o.total || 0),
        commission: Number(o.commissionAmount || 0),
        buyer: o.buyer || { displayName: 'Alıcı' },
        seller: o.seller || { displayName: 'Satıcı' },
        createdAt: o.createdAt,
        itemCount: o.items?.length || 1,
      })));
      setTotal(meta.total || data.length);
    } catch (error) {
      console.error('Orders load error:', error);
      toast.error('Siparişler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending_payment: 'badge-warning',
      paid: 'badge-info',
      preparing: 'badge-info',
      shipped: 'badge-info',
      delivered: 'badge-success',
      completed: 'badge-success',
      cancelled: 'badge-danger',
    };
    const labels: Record<string, string> = {
      pending_payment: 'Ödeme Bekliyor',
      paid: 'Ödendi',
      preparing: 'Hazırlanıyor',
      shipped: 'Kargoda',
      delivered: 'Teslim Edildi',
      completed: 'Tamamlandı',
      cancelled: 'İptal',
    };
    return <span className={`badge ${colors[status]}`}>{labels[status]}</span>;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Siparişler</h1>
          <p className="text-gray-400 mt-1">Toplam {total} sipariş</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Sipariş no ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="admin-input pl-10"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="admin-input w-full sm:w-48"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="admin-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Sipariş No</th>
                  <th>Durum</th>
                  <th>Alıcı</th>
                  <th>Satıcı</th>
                  <th>Ürün</th>
                  <th>Tutar</th>
                  <th>Komisyon</th>
                  <th>Tarih</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-gray-400">
                      Sipariş bulunamadı
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id}>
                      <td className="font-mono text-sm">{order.orderNumber}</td>
                      <td>{getStatusBadge(order.status)}</td>
                      <td>{order.buyer.displayName}</td>
                      <td>{order.seller.displayName}</td>
                      <td>{order.itemCount} adet</td>
                      <td className="text-primary-400 font-medium">
                        ₺{order.totalAmount.toLocaleString()}
                      </td>
                      <td className="text-green-400">
                        ₺{order.commission.toLocaleString()}
                      </td>
                      <td>{new Date(order.createdAt).toLocaleDateString('tr-TR')}</td>
                      <td>
                        <button
                          className="p-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg"
                          title="Detay"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">Sayfa {page} / {Math.ceil(total / 20)}</p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-secondary disabled:opacity-50"
            >
              Önceki
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= Math.ceil(total / 20)}
              className="btn-secondary disabled:opacity-50"
            >
              Sonraki
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
