import { renderHook } from '@testing-library/react-native';
import { useCartStore } from '@/stores/cart.store';
import useCart from './useCart';

// Wrapper over the cart store — assert it surfaces the store actions and the
// promo-aware selectors. Seed `items` via setState (bypasses cache persistence).
beforeEach(() =>
  useCartStore.setState({
    items: [
      { productId: 1, productName: 'A', salesPrice: 100, quantity: 2, promos: [] },
      { productId: 2, productName: 'B', salesPrice: 50, quantity: 1, promos: [] },
    ],
    hydrated: true,
    warehouse: { id: 'w1' },
  })
);

describe('useCart', () => {
  it('exposes store actions (clear maps to clearAll)', async () => {
    const { result } = await renderHook(() => useCart());
    const s = useCartStore.getState();
    expect(result.current.setQty).toBe(s.setQty);
    expect(result.current.remove).toBe(s.remove);
    expect(result.current.addSerial).toBe(s.addSerial);
    expect(result.current.clear).toBe(s.clearAll);
    expect(result.current.refresh).toBe(s.refresh);
  });

  it('derives subtotal / totalItems / netSubtotal from items', async () => {
    const { result } = await renderHook(() => useCart());
    expect(result.current.subtotal).toBe(250); // 100*2 + 50*1
    expect(result.current.totalItems).toBe(3); // 2 + 1
    expect(result.current.netSubtotal).toBe(250); // no promos
    expect(result.current.promoTotal).toBe(0);
    expect(result.current.warehouse).toEqual({ id: 'w1' });
    expect(result.current.hydrated).toBe(true);
  });

  it('reflects the current items array', async () => {
    const { result } = await renderHook(() => useCart());
    expect(result.current.items).toHaveLength(2);
  });
});
