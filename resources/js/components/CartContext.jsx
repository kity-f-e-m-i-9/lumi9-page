import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../lib/api';
import { useToast } from './ToastContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const refresh = useCallback(async () => {
    try {
      const data = await apiFetch('/api/cart');
      setItems(data.items || []);
      setSubtotal(data.subtotal || 0);
      setItemCount(data.itemCount || 0);
    } catch {
      // Cart failing to load shouldn't break the page; drawer just stays empty.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addToCart = useCallback(async (variantId, addval = 1) => {
    try {
      await apiFetch('/api/cart/add', {
        method: 'POST',
        body: JSON.stringify({ id: variantId, type: 1, addval }),
      });
      await refresh();
      return true;
    } catch (err) {
      toast.error(err.message);
      return false;
    }
  }, [refresh, toast]);

  const setQty = useCallback(async (variantId, qty) => {
    try {
      await apiFetch('/api/cart/add', {
        method: 'POST',
        body: JSON.stringify({ id: variantId, type: 3, addval: qty }),
      });
      await refresh();
      return true;
    } catch (err) {
      toast.error(err.message);
      return false;
    }
  }, [refresh, toast]);

  const removeItem = useCallback(async (variantId) => {
    try {
      await apiFetch('/api/cart/add', {
        method: 'POST',
        body: JSON.stringify({ id: variantId, type: 2, addval: 0 }),
      });
      await refresh();
      return true;
    } catch (err) {
      toast.error(err.message);
      return false;
    }
  }, [refresh, toast]);

  const clearCart = useCallback(async () => {
    try {
      await apiFetch('/api/cart/clear', { method: 'POST' });
      await refresh();
      return true;
    } catch (err) {
      toast.error(err.message);
      return false;
    }
  }, [refresh, toast]);

  const value = useMemo(
    () => ({ items, subtotal, itemCount, loading, addToCart, setQty, removeItem, clearCart, refresh }),
    [items, subtotal, itemCount, loading, addToCart, setQty, removeItem, clearCart, refresh]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
