import { Plus, Loader2, Star, Check } from 'lucide-react';
import type { Product } from '../types';
import { formatINR } from '../data/products';

interface ProductCardProps {
  product: Product;
  inCart: boolean;
  onAdd: () => void;
  loading: boolean;
}

export function ProductCard({ product, inCart, onAdd, loading }: ProductCardProps) {
  const rating = 4 + (product.productId.charCodeAt(2) % 10) / 10;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-white/[0.06] bg-surface-850 transition-all duration-300 hover:border-white/10 hover:shadow-card-hover">
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-800">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          loading="lazy"
        />
        {product.badge && (
          <span className="absolute left-3 top-3 rounded-md bg-white px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-surface-950">
            {product.badge}
          </span>
        )}
        {inCart && (
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-md bg-success/90 px-2.5 py-1 text-[11px] font-semibold text-white">
            <Check className="h-3 w-3" />
            In cart
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            {product.category}
          </span>
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-warning text-warning" />
            <span className="text-xs font-medium text-slate-400">{rating.toFixed(1)}</span>
          </div>
        </div>

        <h3 className="mt-2 text-base font-semibold leading-snug text-white">{product.name}</h3>
        <p className="mt-1.5 line-clamp-2 flex-1 text-sm leading-relaxed text-slate-500">
          {product.description}
        </p>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/[0.06] pt-4">
          <div>
            <p className="text-lg font-bold text-white">{formatINR(product.price)}</p>
            <p className="text-[11px] text-slate-600">Inclusive of all taxes</p>
          </div>
          <button
            onClick={onAdd}
            disabled={loading}
            className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-50 ${
              inCart
                ? 'border border-white/10 bg-surface-800 text-slate-200 hover:bg-surface-700'
                : 'bg-accent text-white hover:bg-accent-light'
            }`}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            {inCart ? 'Add more' : 'Add'}
          </button>
        </div>
      </div>
    </article>
  );
}
