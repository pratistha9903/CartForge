import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, Tag, Sparkles, Shield, CreditCard } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { formatINR } from '../data/products';
import type { CheckoutSummary } from '../types';

export function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [checkout, setCheckout] = useState<CheckoutSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .checkout()
      .then((data) => {
        if (!data.items?.length && data.subtotal === 0) {
          navigate('/');
          return;
        }
        setCheckout(data);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load checkout'))
      .finally(() => setLoading(false));
  }, [navigate]);

  const handlePlaceOrder = async () => {
    setPlacing(true);
    setError('');
    try {
      const order = await api.completeCheckout();
      navigate(`/order-success/${order.orderId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place order');
      setPlacing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-950">
        <Loader2 className="h-7 w-7 animate-spin text-accent" />
      </div>
    );
  }

  if (!checkout) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface-950">
      <Header itemCount={checkout.items?.reduce((s, i) => s + i.quantity, 0) ?? 0} />

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to shop
        </Link>

        <h1 className="text-2xl font-bold text-white sm:text-3xl">Checkout</h1>
        <p className="mt-2 text-slate-400">Review your order and confirm payment.</p>

        {error && (
          <div className="mt-6 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="mt-8 space-y-6">
          {/* Delivery info */}
          <section className="rounded-xl border border-white/[0.06] bg-surface-850 p-6">
            <h2 className="font-semibold text-white">Delivery details</h2>
            <div className="mt-4 space-y-1 text-sm">
              <p className="font-medium text-slate-200">{user?.name}</p>
              <p className="text-slate-500">{user?.email}</p>
            </div>
          </section>

          {/* Items */}
          <section className="rounded-xl border border-white/[0.06] bg-surface-850 p-6">
            <h2 className="mb-4 font-semibold text-white">
              Order items ({checkout.items?.length ?? 0})
            </h2>
            <div className="space-y-4">
              {checkout.items?.map((item) => (
                <div key={item.productId} className="flex gap-4">
                  {item.imageUrl && (
                    <img src={item.imageUrl} alt={item.name} className="h-16 w-16 rounded-lg object-cover" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-white">{item.name}</p>
                    <p className="text-xs text-slate-500">{item.category} · Qty {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-white">{formatINR(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Payment summary */}
          <section className="rounded-xl border border-white/[0.06] bg-surface-850 p-6">
            <h2 className="mb-4 font-semibold text-white">Payment summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span>{formatINR(checkout.subtotal)}</span>
              </div>
              {(checkout.tierDiscount ?? 0) > 0 && (
                <div className="flex justify-between text-success">
                  <span className="flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5" />
                    {checkout.appliedTier} tier discount
                  </span>
                  <span>-{formatINR(checkout.tierDiscount!)}</span>
                </div>
              )}
              {(checkout.diversityBonus ?? 0) > 0 && (
                <div className="flex justify-between text-success">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    Diversity bonus
                  </span>
                  <span>-{formatINR(checkout.diversityBonus!)}</span>
                </div>
              )}
              <div className="border-t border-white/[0.06] pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-white">Total</span>
                  <span className="text-white">{formatINR(checkout.finalTotal)}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Trust */}
          <div className="flex flex-wrap gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5" /> Secure payment
            </span>
            <span className="flex items-center gap-1.5">
              <CreditCard className="h-3.5 w-3.5" /> Tier rewards applied
            </span>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={placing}
            className="btn-primary w-full py-4 text-base"
          >
            {placing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Placing order…
              </>
            ) : (
              <>Place order · {formatINR(checkout.finalTotal)}</>
            )}
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
