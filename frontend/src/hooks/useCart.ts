import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import type { Cart, CheckoutSummary } from '../types';

export function useCart() {
  const { user, isAuthenticated } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [checkout, setCheckout] = useState<CheckoutSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setCart(null);
      setCheckout(null);
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const cartData = await api.getCart();
      setCart(cartData);

      if (cartData.items.length > 0) {
        const summary = await api.checkout();
        setCheckout(summary);
      } else {
        setCheckout(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    setLoading(true);
    refresh();
  }, [refresh]);

  const addToCart = async (item: Parameters<typeof api.addItem>[0]) => {
    setActionLoading(true);
    try {
      const updated = await api.addItem(item);
      setCart(updated);
      setCheckout(await api.checkout());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add item');
    } finally {
      setActionLoading(false);
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    setActionLoading(true);
    try {
      const updated =
        quantity <= 0
          ? await api.removeItem(productId)
          : await api.updateItem(productId, quantity);
      setCart(updated);
      setCheckout(updated.items.length > 0 ? await api.checkout() : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update quantity');
    } finally {
      setActionLoading(false);
    }
  };

  const removeFromCart = async (productId: string) => {
    setActionLoading(true);
    try {
      const updated = await api.removeItem(productId);
      setCart(updated);
      setCheckout(updated.items.length > 0 ? await api.checkout() : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove item');
    } finally {
      setActionLoading(false);
    }
  };

  const clearCart = async () => {
    setActionLoading(true);
    try {
      const updated = await api.clearCart();
      setCart(updated);
      setCheckout(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear cart');
    } finally {
      setActionLoading(false);
    }
  };

  return {
    cart,
    checkout,
    loading,
    error,
    actionLoading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refresh,
  };
}
