import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, ShoppingBag, Sparkles, Shield, Truck, Tag } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ProductGrid } from '../components/ProductGrid';
import { CartPanel } from '../components/CartPanel';
import { products } from '../data/products';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import type { Product } from '../types';

const categories = ['All', ...Array.from(new Set(products.map((p) => p.category)))];

const trustItems = [
  { icon: Shield, label: 'Secure checkout' },
  { icon: Tag, label: 'Tier rewards' },
  { icon: Truck, label: 'Fast delivery' },
  { icon: Sparkles, label: 'Smart pricing' },
];

function EmptyCart() {
  return (
    <div className="rounded-xl border border-dashed border-white/10 bg-surface-850/30 px-6 py-14 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface-800">
        <ShoppingBag className="h-6 w-6 text-slate-500" />
      </div>
      <h3 className="font-semibold text-white">Your cart is empty</h3>
      <p className="mx-auto mt-2 max-w-[240px] text-sm text-slate-500">
        Explore our collection and add items to unlock exclusive tier discounts.
      </p>
    </div>
  );
}

function CartSidebarLogin() {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-surface-850 p-6">
      <h3 className="font-semibold text-white">Your cart</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">
        Sign in to add items, track your order total, and unlock tier-based savings.
      </p>
      <div className="mt-6 space-y-2.5">
        <Link to="/login" className="btn-primary w-full py-2.5">
          Sign in
        </Link>
        <Link to="/signup" className="btn-secondary w-full py-2.5">
          Create account
        </Link>
      </div>
    </div>
  );
}

export function ShopPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const {
    cart,
    checkout,
    loading,
    error,
    actionLoading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const [activeCategory, setActiveCategory] = useState('All');

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'All') return products;
    return products.filter((p) => p.category === activeCategory);
  }, [activeCategory]);

  const cartProductIds = new Set(cart?.items.map((i) => i.productId) ?? []);

  const handleAdd = async (product: Product) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    await addToCart({
      productId: product.productId,
      name: product.name,
      price: product.price,
      category: product.category,
      imageUrl: product.imageUrl,
    });
    showToast(`${product.name} added to your cart`);
  };

  if (authLoading || (isAuthenticated && loading)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-950">
        <Loader2 className="h-7 w-7 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface-950">
      <Header itemCount={cart?.itemCount ?? 0} />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/[0.06] bg-hero-gradient">
        <div className="absolute inset-0 bg-mesh-auth opacity-40" />
        <div className="relative mx-auto max-w-7xl px-6 py-14 sm:py-16">
          <p className="section-label mb-3">New season collection</p>
          <h1 className="text-balance max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Curated products with intelligent rewards
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg">
            Every purchase counts toward your reward tier. Shop across categories to unlock up to 20% off plus diversity bonuses.
          </p>

          <div className="mt-8 flex flex-wrap gap-6">
            {trustItems.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-sm text-slate-400">
                <Icon className="h-4 w-4 text-accent-light" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      <main className="relative mx-auto w-full max-w-7xl flex-1 px-6 py-10">
        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3.5">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {/* Category filter */}
        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                activeCategory === cat
                  ? 'bg-white text-surface-950'
                  : 'border border-white/10 bg-surface-850 text-slate-400 hover:border-white/15 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-10 xl:grid-cols-[1fr_380px]">
          <ProductGrid
            products={filteredProducts}
            cartProductIds={cartProductIds}
            onAdd={handleAdd}
            loading={actionLoading}
            totalCount={products.length}
            activeCategory={activeCategory}
          />

          <div className="xl:sticky xl:top-24 xl:self-start">
            {!isAuthenticated ? (
              <CartSidebarLogin />
            ) : cart && checkout && cart.items.length > 0 ? (
              <CartPanel
                cart={cart}
                checkout={checkout}
                onUpdateQuantity={updateQuantity}
                onRemove={removeFromCart}
                onClear={clearCart}
                onProceedCheckout={() => navigate('/checkout')}
                loading={actionLoading}
              />
            ) : (
              <EmptyCart />
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
