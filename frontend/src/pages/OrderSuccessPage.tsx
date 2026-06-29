import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Loader2, CheckCircle2, ArrowRight, Tag, Sparkles, Package } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { api } from '../api/client';
import { formatINR } from '../data/products';
import type { OrderConfirmation } from '../types';

export function OrderSuccessPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<OrderConfirmation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orderId) {
      setError('Invalid order');
      setLoading(false);
      return;
    }

    api
      .getOrder(orderId)
      .then(setOrder)
      .catch((err) => setError(err instanceof Error ? err.message : 'Order not found'))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-950">
        <Loader2 className="h-7 w-7 animate-spin text-accent" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex min-h-screen flex-col bg-surface-950">
        <Header itemCount={0} />
        <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <p className="text-red-300">{error || 'Order not found'}</p>
          <Link to="/orders" className="btn-primary mt-6">View my orders</Link>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface-950">
      <Header itemCount={0} />

      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success/15">
            <CheckCircle2 className="h-10 w-10 text-success" />
          </div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">Order confirmed!</h1>
          <p className="mt-3 text-slate-400">
            Your order has been saved. You can view it anytime in My Orders.
          </p>
        </div>

        <div className="mt-8 rounded-xl border border-white/[0.06] bg-surface-850 p-6">
          <div className="mb-6 flex items-center justify-between border-b border-white/[0.06] pb-4">
            <div>
              <p className="text-xs text-slate-500">Order ID</p>
              <p className="font-mono text-lg font-bold text-white">{order.orderId}</p>
            </div>
            <span className="rounded-full bg-success/15 px-3 py-1 text-xs font-semibold text-success">
              {order.status || 'confirmed'}
            </span>
          </div>

          <h2 className="mb-4 text-sm font-semibold text-white">Items ordered</h2>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.productId} className="flex gap-3 rounded-lg bg-surface-900/50 p-3">
                {item.imageUrl && (
                  <img src={item.imageUrl} alt={item.name} className="h-14 w-14 rounded-lg object-cover" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{item.name}</p>
                  <p className="text-xs text-slate-500">{item.category} · Qty {item.quantity}</p>
                </div>
                <p className="text-sm font-semibold text-white">
                  {formatINR(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-2 border-t border-white/[0.06] pt-4 text-sm">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal</span>
              <span>{formatINR(order.subtotal)}</span>
            </div>
            {(order.tierDiscount ?? 0) > 0 && (
              <div className="flex justify-between text-success">
                <span className="flex items-center gap-1">
                  <Tag className="h-3.5 w-3.5" /> {order.appliedTier} discount
                </span>
                <span>-{formatINR(order.tierDiscount!)}</span>
              </div>
            )}
            {(order.diversityBonus ?? 0) > 0 && (
              <div className="flex justify-between text-success">
                <span className="flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5" /> Diversity bonus
                </span>
                <span>-{formatINR(order.diversityBonus!)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 text-base font-bold">
              <span className="text-white">Total paid</span>
              <span className="text-white">{formatINR(order.finalTotal)}</span>
            </div>
            {order.discount > 0 && (
              <p className="text-right text-xs text-success">You saved {formatINR(order.discount)}</p>
            )}
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link to="/dashboard" className="btn-secondary gap-2 px-6 py-3">
            <Package className="h-4 w-4" />
            Go to Dashboard
          </Link>
          <Link to="/" className="btn-primary gap-2 px-6 py-3">
            Continue shopping
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
