import { Minus, Plus, Trash2, ShoppingCart, Tag, Sparkles } from 'lucide-react';
import { TierProgress } from './TierProgress';
import type { Cart, CheckoutSummary } from '../types';
import { formatINR } from '../data/products';

interface CartPanelProps {
  cart: Cart;
  checkout: CheckoutSummary;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  onClear: () => void;
  onProceedCheckout: () => void;
  loading: boolean;
}

export function CartPanel({
  cart,
  checkout,
  onUpdateQuantity,
  onRemove,
  onClear,
  onProceedCheckout,
  loading,
}: CartPanelProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-white/[0.06] bg-surface-850 shadow-card">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
          <div className="flex items-center gap-2.5">
            <ShoppingCart className="h-[18px] w-[18px] text-accent-light" />
            <h2 className="font-semibold text-white">Order summary</h2>
          </div>
          <span className="rounded-full bg-surface-800 px-2.5 py-0.5 text-xs font-medium text-slate-400">
            {cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'}
          </span>
        </div>

        <div className="max-h-80 space-y-3 overflow-y-auto p-4">
          {cart.items.map((item) => (
            <div
              key={item.productId}
              className="flex gap-3 rounded-lg border border-white/[0.04] bg-surface-900/50 p-3"
            >
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="h-16 w-16 rounded-lg object-cover"
                />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{item.name}</p>
                <p className="text-xs text-slate-500">{item.category}</p>
                <p className="mt-1 text-sm font-semibold text-white">
                  {formatINR(item.price * item.quantity)}
                </p>
              </div>
              <div className="flex flex-col items-end justify-between">
                <button
                  onClick={() => onRemove(item.productId)}
                  disabled={loading}
                  className="rounded p-1 text-slate-600 transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                <div className="flex items-center rounded-lg border border-white/10 bg-surface-800">
                  <button
                    onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
                    disabled={loading}
                    className="px-2 py-1.5 hover:bg-white/[0.04] disabled:opacity-50"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="min-w-[24px] text-center text-xs font-semibold">{item.quantity}</span>
                  <button
                    onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                    disabled={loading}
                    className="px-2 py-1.5 hover:bg-white/[0.04] disabled:opacity-50"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-white/[0.06] px-5 py-3">
          <button
            onClick={onClear}
            disabled={loading}
            className="text-xs font-medium text-slate-500 transition-colors hover:text-red-400 disabled:opacity-50"
          >
            Clear all items
          </button>
        </div>
      </div>

      <TierProgress checkout={checkout} />

      <div className="rounded-xl border border-white/[0.06] bg-surface-850 p-5 shadow-card">
        <div className="space-y-3 text-sm">
          <div className="flex justify-between text-slate-400">
            <span>Subtotal</span>
            <span className="font-medium text-slate-200">{formatINR(checkout.subtotal)}</span>
          </div>

          {(checkout.tierDiscount ?? 0) > 0 && (
            <div className="flex justify-between text-success">
              <span className="flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5" />
                {checkout.appliedTier} tier ({checkout.campaign?.activeTier.discountPercent}%)
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
            <div className="flex justify-between">
              <span className="font-semibold text-white">Total</span>
              <span className="text-xl font-bold text-white">{formatINR(checkout.finalTotal)}</span>
            </div>
            {checkout.discount > 0 && (
              <p className="mt-1 text-right text-xs text-success">
                You save {formatINR(checkout.discount)}
              </p>
            )}
          </div>
        </div>

        <button
          onClick={onProceedCheckout}
          disabled={loading || cart.items.length === 0}
          className="btn-primary mt-5 w-full py-3.5 disabled:opacity-50"
        >
          Proceed to checkout
        </button>
        <p className="mt-3 text-center text-[11px] text-slate-600">
          Secure checkout · Tier rewards applied automatically
        </p>
      </div>
    </div>
  );
}
