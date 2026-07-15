import {
  itemCategory,
  itemCode,
  itemUnitPrice,
  itemSubtotal,
  groupOrderItems,
  isVoucherCategory,
} from './orderItems';

describe('field accessors (name-tolerant)', () => {
  it('itemCategory falls back categoryName → category → null', () => {
    expect(itemCategory({ categoryName: 'A', category: 'B' })).toBe('A');
    expect(itemCategory({ category: 'B' })).toBe('B');
    expect(itemCategory({})).toBeNull();
  });
  it('itemCode falls back productCode → sn → serialNumber → null', () => {
    expect(itemCode({ productCode: 'P', sn: 'S' })).toBe('P');
    expect(itemCode({ sn: 'S' })).toBe('S');
    expect(itemCode({ serialNumber: 'X' })).toBe('X');
    expect(itemCode({})).toBeNull();
  });
  it('itemUnitPrice coerces to number, 0 on garbage', () => {
    expect(itemUnitPrice({ unitPrice: '2500' })).toBe(2500);
    expect(itemUnitPrice({ unitPrice: 'x' })).toBe(0);
  });
});

describe('itemSubtotal', () => {
  it('uses provided subtotal when present', () => {
    expect(itemSubtotal({ subtotal: 999, unitPrice: 1, quantity: 1 })).toBe(999);
  });
  it('computes unitPrice*qty - discount when absent', () => {
    expect(itemSubtotal({ unitPrice: 1000, quantity: 3, discount: 500 })).toBe(2500);
  });
  it('missing fields coerce to 0', () => {
    expect(itemSubtotal({ unitPrice: 1000, quantity: 2 })).toBe(2000);
    expect(itemSubtotal({})).toBe(0);
  });
});

describe('groupOrderItems', () => {
  it('handles null/empty input', () => {
    expect(groupOrderItems(null as any)).toEqual([]);
    expect(groupOrderItems([])).toEqual([]);
  });
  it('groups by productName+unitPrice and sums totals', () => {
    const items = [
      { productName: 'Perdana', unitPrice: 1000, quantity: 1, discount: 0, sn: 'A' },
      { productName: 'Perdana', unitPrice: 1000, quantity: 1, discount: 100, sn: 'B' },
      { productName: 'Pulsa', unitPrice: 5000, quantity: 2, discount: 0 },
    ];
    const groups = groupOrderItems(items);
    expect(groups).toHaveLength(2);

    const perdana = groups.find((g) => g.productName === 'Perdana')!;
    expect(perdana.rows).toHaveLength(2);
    expect(perdana.isGrouped).toBe(true);
    expect(perdana.totalQuantity).toBe(2);
    expect(perdana.totalDiscount).toBe(100);
    expect(perdana.totalSubtotal).toBe(1900); // 1000 + (1000-100)

    const pulsa = groups.find((g) => g.productName === 'Pulsa')!;
    expect(pulsa.isGrouped).toBe(false);
    expect(pulsa.totalSubtotal).toBe(10000);
  });
  it('same name but different price → separate groups', () => {
    const groups = groupOrderItems([
      { productName: 'X', unitPrice: 1000, quantity: 1 },
      { productName: 'X', unitPrice: 2000, quantity: 1 },
    ]);
    expect(groups).toHaveLength(2);
  });
  it('carries first row category onto the group', () => {
    const groups = groupOrderItems([
      { productName: 'X', unitPrice: 1, quantity: 1, categoryName: 'Voucher' },
    ]);
    expect(groups[0].categoryName).toBe('Voucher');
  });
});

describe('isVoucherCategory', () => {
  it('false for null/empty', () => {
    expect(isVoucherCategory(null)).toBe(false);
    expect(isVoucherCategory('')).toBe(false);
  });
  it('matches voucher/voucer case-insensitively', () => {
    expect(isVoucherCategory('Voucher Game')).toBe(true);
    expect(isVoucherCategory('VOUCER')).toBe(true);
    expect(isVoucherCategory('Kartu Perdana')).toBe(false);
  });
});
