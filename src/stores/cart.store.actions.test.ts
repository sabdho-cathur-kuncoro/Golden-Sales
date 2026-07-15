// Mock the SQLite-backed cache; assert actions persist through it without
// touching native. cartCache methods are async no-ops here.
// Define jest.fn()s inline in the factory, then import the mocked module so
// assertions target the exact instances the store calls.
jest.mock('@/storage/cart.cache', () => ({
  cartCache: { save: jest.fn(), clear: jest.fn(), load: jest.fn() },
}));

import { cartCache } from '@/storage/cart.cache';
import { useCartStore } from './cart.store';

const saveMock = cartCache.save as jest.Mock;
const clearMock = cartCache.clear as jest.Mock;
const loadMock = cartCache.load as jest.Mock;

const product = (id: string, over: any = {}) => ({
  id,
  productName: `P-${id}`,
  salesPrice: 1000,
  ...over,
});

beforeEach(() => {
  useCartStore.setState({ items: [], warehouse: null, hydrated: false });
  saveMock.mockReset().mockResolvedValue(undefined);
  clearMock.mockReset().mockResolvedValue(undefined);
  loadMock.mockReset().mockResolvedValue([]);
});

describe('setQty', () => {
  it('adds a non-serial line and persists', () => {
    useCartStore.getState().setQty(product('1'), 3);
    const items = useCartStore.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ productId: '1', quantity: 3, serials: [] });
    expect(saveMock).toHaveBeenCalled();
  });
  it('replaces the existing line for the same product id', () => {
    useCartStore.getState().setQty(product('1'), 3);
    useCartStore.getState().setQty(product('1'), 5);
    const items = useCartStore.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(5);
  });
  it('qty <= 0 removes the line', () => {
    useCartStore.getState().setQty(product('1'), 3);
    useCartStore.getState().setQty(product('1'), 0);
    expect(useCartStore.getState().items).toHaveLength(0);
  });
});

describe('addSerial / removeSerial', () => {
  it('adds a serial line with quantity = serials.length', () => {
    useCartStore.getState().addSerial(product('1'), ['a', 'b']);
    const line = useCartStore.getState().items[0];
    expect(line.serials).toEqual(['a', 'b']);
    expect(line.quantity).toBe(2);
  });
  it('empty serials removes the line', () => {
    useCartStore.getState().addSerial(product('1'), ['a']);
    useCartStore.getState().addSerial(product('1'), []);
    expect(useCartStore.getState().items).toHaveLength(0);
  });
  it('removeSerial drops one SN and recomputes quantity', () => {
    useCartStore.getState().addSerial(product('1'), ['a', 'b']);
    useCartStore.getState().removeSerial('1', 'a');
    const line = useCartStore.getState().items[0];
    expect(line.serials).toEqual(['b']);
    expect(line.quantity).toBe(1);
  });
  it('removeSerial empties the line when its last SN goes', () => {
    useCartStore.getState().addSerial(product('1'), ['a']);
    useCartStore.getState().removeSerial('1', 'a');
    expect(useCartStore.getState().items).toHaveLength(0);
  });
});

describe('setWarehouse', () => {
  it('switching to a different warehouse with items empties the cart', () => {
    useCartStore.setState({ warehouse: { id: 'w1' } });
    useCartStore.getState().setQty(product('1'), 2);
    clearMock.mockClear();

    useCartStore.getState().setWarehouse({ id: 'w2' });
    expect(useCartStore.getState().items).toHaveLength(0);
    expect(useCartStore.getState().warehouse).toEqual({ id: 'w2' });
    expect(clearMock).toHaveBeenCalled();
  });
  it('same warehouse id keeps items', () => {
    useCartStore.setState({ warehouse: { id: 'w1' } });
    useCartStore.getState().setQty(product('1'), 2);
    useCartStore.getState().setWarehouse({ id: 'w1' });
    expect(useCartStore.getState().items).toHaveLength(1);
  });
});
