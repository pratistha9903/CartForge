import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Package, ChevronRight, Tag } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { api } from '../api/client';
import { formatINR } from '../data/products';
import type { OrderConfirmation } from '../types';

export function OrdersPage() {
  const [orders, setOrders] = useState<OrderConfirmation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .getOrders()
      .then(setOrders)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load orders'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-surface-950">
      <Header itemCount={0} />

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Order History</h1>
        <p className="mt-2 text-slate-400">
          All your placed orders.{' '}
          <Link to="/dashboard" className="text-accent-light hover:text-white">
            Go to Dashboard →
          </Link>
        </p>

        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="h-7 w-7 animate-spin text-accent" />
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="mt-12 rounded-xl border border-dashed border-white/10 py-16 text-center">
            <Package className="mx-auto h-12 w-12 text-slate-600" />
            <h3 className="mt-4 font-semibold text-white">No orders yet</h3>
            <p className="mt-2 text-sm text-slate-500">Place an order from the shop to see it here.</p>
            <Link to="/" className="btn-primary mt-6 inline-flex px-6 py-2.5">
              Start shopping
            </Link>
          </div>
        )}

        <div className="mt-8 space-y-4">
          {orders.map((order) => (
            <Link
              key={order.orderId}
              to={`/order-success/${order.orderId}`}
              className="block rounded-xl border border-white/[0.06] bg-surface-850 p-5 transition-all hover:border-white/10 hover:shadow-card"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-sm font-semibold text-white">{order.orderId}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {order.items.length} items ·{' '}
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '—'}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold text-white">{formatINR(order.finalTotal)}</p>
                    <p className="flex items-center justify-end gap-1 text-xs text-accent-light">
                      <Tag className="h-3 w-3" />
                      {order.appliedTier}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-500" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
