import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Loader2,
  Package,
  ChevronRight,
  Tag,
  Sparkles,
  LayoutDashboard,
  ShoppingBag,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { formatINR } from '../data/products';
import type { OrderConfirmation } from '../types';

function formatDate(dateStr?: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function LastOrderCard({ order }: { order: OrderConfirmation }) {
  return (
    <section className="rounded-xl border border-accent/20 bg-gradient-to-br from-accent/10 to-surface-850 p-6 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-accent-light" />
          <h2 className="font-semibold text-white">Last order</h2>
        </div>
        <span className="rounded-full bg-success/15 px-3 py-1 text-xs font-semibold text-success">
          {order.status || 'confirmed'}
        </span>
      </div>

      <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-lg font-bold text-white">{order.orderId}</p>
          <p className="mt-1 text-sm text-slate-400">{formatDate(order.createdAt || order.completedAt)}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-white">{formatINR(order.finalTotal)}</p>
          {order.discount > 0 && (
            <p className="text-xs text-success">Saved {formatINR(order.discount)}</p>
          )}
        </div>
      </div>

      <div className="space-y-2 border-t border-white/[0.06] pt-4">
        {order.items.slice(0, 3).map((item) => (
          <div key={item.productId} className="flex items-center justify-between text-sm">
            <span className="text-slate-300">
              {item.name} <span className="text-slate-500">× {item.quantity}</span>
            </span>
            <span className="text-slate-400">{formatINR(item.price * item.quantity)}</span>
          </div>
        ))}
        {order.items.length > 3 && (
          <p className="text-xs text-slate-500">+ {order.items.length - 3} more items</p>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-xs">
        <span className="flex items-center gap-1 rounded-md bg-surface-800 px-2.5 py-1 text-accent-light">
          <Tag className="h-3 w-3" /> {order.appliedTier} tier
        </span>
        {order.diversityBonus > 0 && (
          <span className="flex items-center gap-1 rounded-md bg-surface-800 px-2.5 py-1 text-success">
            <Sparkles className="h-3 w-3" /> Diversity bonus applied
          </span>
        )}
      </div>

      <Link
        to={`/order-success/${order.orderId}`}
        className="btn-primary mt-5 inline-flex gap-2 px-5 py-2.5 text-sm"
      >
        View full details
        <ArrowRight className="h-4 w-4" />
      </Link>
    </section>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
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

  const lastOrder = orders[0] ?? null;
  const totalSpent = orders.reduce((sum, o) => sum + o.finalTotal, 0);

  return (
    <div className="flex min-h-screen flex-col bg-surface-950">
      <Header itemCount={0} />

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-accent-light">
            <LayoutDashboard className="h-5 w-5" />
            <span className="text-sm font-medium">Account Dashboard</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
            Welcome back, {user?.name.split(' ')[0]}
          </h1>
          <p className="mt-1 text-slate-400">Track your orders and shopping activity.</p>
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="h-7 w-7 animate-spin text-accent" />
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Stats */}
            <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-white/[0.06] bg-surface-850 p-4">
                <p className="text-xs text-slate-500">Total orders</p>
                <p className="mt-1 text-2xl font-bold text-white">{orders.length}</p>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-surface-850 p-4">
                <p className="text-xs text-slate-500">Total spent</p>
                <p className="mt-1 text-2xl font-bold text-white">{formatINR(totalSpent)}</p>
              </div>
              <div className="col-span-2 rounded-xl border border-white/[0.06] bg-surface-850 p-4 sm:col-span-1">
                <p className="text-xs text-slate-500">Account</p>
                <p className="mt-1 truncate text-sm font-medium text-slate-200">{user?.email}</p>
              </div>
            </div>

            {lastOrder ? (
              <LastOrderCard order={lastOrder} />
            ) : (
              <div className="rounded-xl border border-dashed border-white/10 py-12 text-center">
                <Package className="mx-auto h-12 w-12 text-slate-600" />
                <h3 className="mt-4 font-semibold text-white">No orders yet</h3>
                <p className="mt-2 text-sm text-slate-500">Your last order will appear here after checkout.</p>
                <Link to="/" className="btn-primary mt-6 inline-flex gap-2 px-6 py-2.5">
                  <ShoppingBag className="h-4 w-4" />
                  Start shopping
                </Link>
              </div>
            )}

            {/* Order history */}
            {orders.length > 0 && (
              <section className="mt-10">
                <h2 className="mb-4 text-lg font-semibold text-white">Order history</h2>
                <div className="space-y-3">
                  {orders.map((order, index) => (
                    <Link
                      key={order.orderId}
                      to={`/order-success/${order.orderId}`}
                      className={`block rounded-xl border p-4 transition-all hover:shadow-card ${
                        index === 0
                          ? 'border-accent/20 bg-surface-850'
                          : 'border-white/[0.06] bg-surface-850/50 hover:border-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-mono text-sm font-semibold text-white">{order.orderId}</p>
                            {index === 0 && (
                              <span className="rounded bg-accent/20 px-1.5 py-0.5 text-[10px] font-bold uppercase text-accent-light">
                                Latest
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-xs text-slate-500">
                            {order.items.length} items · {formatDate(order.createdAt || order.completedAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="font-bold text-white">{formatINR(order.finalTotal)}</p>
                            <p className="flex items-center justify-end gap-1 text-xs text-slate-500">
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
              </section>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
