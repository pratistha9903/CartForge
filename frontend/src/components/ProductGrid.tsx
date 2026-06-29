import { ProductCard } from './ProductCard';
import type { Product } from '../types';

interface ProductGridProps {
  products: Product[];
  cartProductIds: Set<string>;
  onAdd: (product: Product) => void;
  loading: boolean;
  totalCount?: number;
  activeCategory?: string;
}

export function ProductGrid({
  products,
  cartProductIds,
  onAdd,
  loading,
  totalCount,
  activeCategory = 'All',
}: ProductGridProps) {
  return (
    <section>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-xl font-bold text-white sm:text-2xl">
            {activeCategory === 'All' ? 'All Products' : activeCategory}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {products.length} of {totalCount ?? products.length} items
          </p>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="rounded-xl border border-white/[0.06] bg-surface-850/30 py-16 text-center">
          <p className="text-slate-500">No products in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
          {products.map((product, i) => (
            <div key={product.productId} style={{ animationDelay: `${i * 60}ms` }} className="animate-slide-up">
              <ProductCard
                product={product}
                inCart={cartProductIds.has(product.productId)}
                onAdd={() => onAdd(product)}
                loading={loading}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
