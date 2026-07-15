// cart.store imports @/storage/cart.cache (→ expo-sqlite). The selectors under
// test are pure over a plain state object; mock the cache so no native/SQLite
// module loads.
jest.mock('@/storage/cart.cache', () => ({ cartCache: {} }));

import {
  lineUnits,
  selectCartCount,
  selectSubtotal,
  selectPromoTotal,
  selectNetSubtotal,
} from './cart.store';

const cashPromo = { discountType: 'cash', discountValue: 500, minQuantity: 1 };

// A non-serial line (counts by quantity) and a serial line (counts by SN count).
const state = (items: any[]) => ({ items } as any);

describe('lineUnits', () => {
  it('serial line counts by serials.length', () => {
    expect(lineUnits({ serials: ['a', 'b', 'c'], quantity: 99 })).toBe(3);
  });
  it('non-serial line counts by quantity', () => {
    expect(lineUnits({ quantity: 4 })).toBe(4);
    expect(lineUnits({})).toBe(0);
  });
});

describe('cart money selectors', () => {
  const items = [
    { salesPrice: 1000, quantity: 2, promos: [] }, // gross 2000, no promo
    { salesPrice: 1000, serials: ['x', 'y'], promos: [cashPromo] }, // 2 units, 500 off each
  ];

  it('selectCartCount sums units across lines', () => {
    expect(selectCartCount(state(items))).toBe(4); // 2 + 2
  });
  it('selectSubtotal is gross (pre-promo)', () => {
    expect(selectSubtotal(state(items))).toBe(4000); // 2000 + 2000
  });
  it('selectPromoTotal sums per-unit discount * units', () => {
    expect(selectPromoTotal(state(items))).toBe(1000); // 0 + 500*2
  });
  it('selectNetSubtotal = gross - promo', () => {
    expect(selectNetSubtotal(state(items))).toBe(3000); // 2000 + (500*2)
  });
  it('empty cart → zeros', () => {
    expect(selectCartCount(state([]))).toBe(0);
    expect(selectSubtotal(state([]))).toBe(0);
    expect(selectNetSubtotal(state([]))).toBe(0);
  });
});
