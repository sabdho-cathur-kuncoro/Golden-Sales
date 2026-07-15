import { renderHook, act, waitFor } from '@testing-library/react-native';

jest.mock('@/services/global.services', () => ({
  getWarehousesService: jest.fn(),
}));
// Cart store: usable both as a selector hook AND via getState(). Keep a mutable
// state object inside the factory and expose setWarehouse as a jest.fn.
jest.mock('@/stores/cart.store', () => {
  const state: any = {
    warehouse: null,
    setWarehouse: jest.fn((w: any) => {
      state.warehouse = w;
    }),
  };
  const useCartStore: any = (selector: any) =>
    selector ? selector(state) : state;
  useCartStore.getState = () => state;
  useCartStore.__state = state;
  return { useCartStore };
});
jest.mock('@/stores/auth.store', () => {
  const state: any = { user: null };
  const useAuthStore: any = (selector: any) =>
    selector ? selector(state) : state;
  useAuthStore.getState = () => state;
  useAuthStore.__state = state;
  return { useAuthStore };
});
jest.mock('@/hooks/useToast', () => {
  const warning = jest.fn();
  const success = jest.fn();
  const error = jest.fn();
  const info = jest.fn();
  return { useToast: () => ({ warning, success, error, info }) };
});

import { getWarehousesService } from '@/services/global.services';
import { useCartStore } from '@/stores/cart.store';
import { useAuthStore } from '@/stores/auth.store';
import { useToast } from '@/hooks/useToast';
import useWarehouse from './useWarehouse';

const getWarehouses = getWarehousesService as jest.Mock;
const cartState = (useCartStore as any).__state;
const authState = (useAuthStore as any).__state;
const setWarehouse = cartState.setWarehouse as jest.Mock;
const warning = useToast().warning as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  cartState.warehouse = null;
  authState.user = null;
  getWarehouses.mockResolvedValue([]);
});

describe('useWarehouse', () => {
  it('fetches warehouses on mount and clears loading', async () => {
    getWarehouses.mockResolvedValueOnce([{ id: 1, name: 'W1' }]);
    const { result } = await renderHook(() => useWarehouse());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.warehouses).toEqual([{ id: 1, name: 'W1' }]);
    expect(getWarehouses).toHaveBeenCalled();
  });

  it('locks to the row matching the login user.warehouseName', async () => {
    authState.user = { warehouseName: 'Gudang B' };
    getWarehouses.mockResolvedValueOnce([
      { id: 1, name: 'Gudang A' },
      { id: 2, name: 'Gudang B' },
    ]);
    const { result } = await renderHook(() => useWarehouse());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(setWarehouse).toHaveBeenCalledWith({ id: 2, name: 'Gudang B' });
  });

  it('falls back to the first row when no name matches', async () => {
    authState.user = { warehouseName: 'Nonexistent' };
    getWarehouses.mockResolvedValueOnce([
      { id: 1, name: 'Gudang A' },
      { id: 2, name: 'Gudang B' },
    ]);
    const { result } = await renderHook(() => useWarehouse());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(setWarehouse).toHaveBeenCalledWith({ id: 1, name: 'Gudang A' });
  });

  it('does not override when the stored warehouse already equals the target', async () => {
    cartState.warehouse = { id: 2, name: 'Gudang B' };
    authState.user = { warehouseName: 'Gudang B' };
    getWarehouses.mockResolvedValueOnce([
      { id: 1, name: 'Gudang A' },
      { id: 2, name: 'Gudang B' },
    ]);
    const { result } = await renderHook(() => useWarehouse());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(setWarehouse).not.toHaveBeenCalled();
  });

  it('does not reconcile an empty warehouse list', async () => {
    getWarehouses.mockResolvedValueOnce([]);
    const { result } = await renderHook(() => useWarehouse());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(setWarehouse).not.toHaveBeenCalled();
    expect(result.current.warehouses).toEqual([]);
  });

  it('warns and clears loading when the fetch rejects', async () => {
    getWarehouses.mockRejectedValueOnce(new Error('offline'));
    const { result } = await renderHook(() => useWarehouse());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(warning).toHaveBeenCalled();
    expect(warning.mock.calls[0][0]).toBe('Perhatian');
    expect(result.current.warehouses).toEqual([]);
  });

  it('exposes the current warehouse from the cart store', async () => {
    cartState.warehouse = { id: 9, name: 'Locked' };
    const { result } = await renderHook(() => useWarehouse());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.warehouse).toEqual({ id: 9, name: 'Locked' });
  });
});
