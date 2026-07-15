import {
  pickPromo,
  discountPerUnit,
  promoLabel,
  describePromos,
  lineWithPromo,
} from './promo';

const cashPromo = { discountType: 'cash', discountValue: 500, minQuantity: 2, maxQuantity: 10 };
const pctPromo = { discountType: 'percentage', discountValue: 10, minQuantity: 5, maxQuantity: null };
const pascal = { DiscountType: 'cash', DiscountValue: 300, MinQuantity: 3, MaxQuantity: null };

describe('pickPromo', () => {
  it('returns null for non-array / empty / qty<=0', () => {
    expect(pickPromo(null, 5)).toBeNull();
    expect(pickPromo([], 5)).toBeNull();
    expect(pickPromo([cashPromo], 0)).toBeNull();
    expect(pickPromo([cashPromo], -1)).toBeNull();
  });
  it('matches when min<=qty<=max and discount>0', () => {
    expect(pickPromo([cashPromo], 2)).toBe(cashPromo);
    expect(pickPromo([cashPromo], 10)).toBe(cashPromo);
  });
  it('rejects below min or above max', () => {
    expect(pickPromo([cashPromo], 1)).toBeNull();
    expect(pickPromo([cashPromo], 11)).toBeNull();
  });
  it('treats null max as unbounded', () => {
    expect(pickPromo([pctPromo], 9999)).toBe(pctPromo);
  });
  it('ignores promos with zero discount value', () => {
    expect(pickPromo([{ discountValue: 0, minQuantity: 1 }], 5)).toBeNull();
  });
  it('tolerates PascalCase keys', () => {
    expect(pickPromo([pascal], 5)).toBe(pascal);
  });
  it('returns the first matching promo (priority order preserved)', () => {
    const a = { discountValue: 1, minQuantity: 1 };
    const b = { discountValue: 2, minQuantity: 1 };
    expect(pickPromo([a, b], 3)).toBe(a);
  });
});

describe('discountPerUnit', () => {
  it('returns 0 for no promo', () => {
    expect(discountPerUnit(null, 1000)).toBe(0);
  });
  it('cash → flat value', () => {
    expect(discountPerUnit(cashPromo, 1000)).toBe(500);
  });
  it('percentage → rounded percent of base', () => {
    expect(discountPerUnit(pctPromo, 1000)).toBe(100); // 10%
    expect(discountPerUnit({ discountType: 'percentage', discountValue: 33 }, 100)).toBe(33);
    expect(discountPerUnit({ discountType: 'percentage', discountValue: 33 }, 101)).toBe(33); // round(33.33)
  });
});

describe('promoLabel', () => {
  it('empty for no promo', () => {
    expect(promoLabel(null)).toBe('');
  });
  it('cash label with id-ID grouping', () => {
    expect(promoLabel({ discountType: 'cash', discountValue: 1500 })).toBe('Potongan Rp 1.500');
  });
  it('percentage label', () => {
    expect(promoLabel(pctPromo)).toBe('Diskon 10%');
  });
});

describe('describePromos', () => {
  it('non-array → empty shape', () => {
    expect(describePromos(null, 5)).toEqual({ active: null, next: null, all: [] });
  });
  it('picks active and lowest next-tier above current qty', () => {
    const tier5 = { discountValue: 1, minQuantity: 5 };
    const tier10 = { discountValue: 1, minQuantity: 10 };
    const tier20 = { discountValue: 1, minQuantity: 20 };
    const r = describePromos([tier5, tier20, tier10], 5);
    expect(r.active).toBe(tier5);
    expect(r.next).toBe(tier10); // lowest min above 5
    expect(r.all).toHaveLength(3);
  });
  it('next is null when nothing higher', () => {
    expect(describePromos([{ discountValue: 1, minQuantity: 1 }], 5).next).toBeNull();
  });
});

describe('lineWithPromo', () => {
  it('no promo → gross subtotal, empty label', () => {
    expect(lineWithPromo(1000, 3, [])).toEqual({
      promo: null,
      discountPerUnit: 0,
      subtotal: 3000,
      label: '',
    });
  });
  it('applies per-unit discount to subtotal', () => {
    const r = lineWithPromo(1000, 3, [cashPromo]);
    expect(r.discountPerUnit).toBe(500);
    expect(r.subtotal).toBe(1500); // (1000-500)*3
    expect(r.label).toBe('Potongan Rp 500');
  });
  it('never goes negative per unit (max(0,...))', () => {
    const r = lineWithPromo(300, 2, [{ discountType: 'cash', discountValue: 1000, minQuantity: 1 }]);
    expect(r.subtotal).toBe(0);
  });
});
