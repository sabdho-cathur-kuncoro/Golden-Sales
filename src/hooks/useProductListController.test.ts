// Product list controller — fetch (global vs warehouse-scoped) + search filter.
jest.mock('@/hooks/useProducts', () => ({ __esModule: true, default: jest.fn() }));

import { act, renderHook, waitFor } from '@testing-library/react-native';
import useProducts from '@/hooks/useProducts';
import { useAuthStore } from '@/stores/auth.store';
import { useCartStore } from '@/stores/cart.store';
import useProductListController from './useProductListController';

const useProductsMock = useProducts as unknown as jest.Mock;
const fetchProducts = jest.fn();

const PRODUCTS = [
  { productName: 'Router X', category: 'Jaringan' },
  { productName: 'Kabel', category: 'Aksesoris' },
];

beforeEach(() => {
  jest.clearAllMocks();
  useAuthStore.setState({ user: { id: 1, name: 'Sales' } as any });
  useCartStore.setState({ warehouse: null });
  useProductsMock.mockReturnValue({ products: PRODUCTS, loading: false, fetchProducts });
});

describe('useProductListController (global)', () => {
  it('fetches all products on mount and exposes the user', async () => {
    const { result } = await renderHook(() => useProductListController());
    await waitFor(() => expect(fetchProducts).toHaveBeenCalledWith());
    expect(result.current.user).toMatchObject({ id: 1 });
    expect(result.current.filtered).toHaveLength(2);
  });

  it('filters by product name / category via search', async () => {
    const { result } = await renderHook(() => useProductListController());
    await act(async () => result.current.setSearch('router'));
    await waitFor(() => expect(result.current.filtered).toHaveLength(1));
    expect(result.current.filtered[0].productName).toBe('Router X');
  });
});

describe('useProductListController (scoped)', () => {
  it('returns empty and does not fetch until a warehouse is picked', async () => {
    const { result } = await renderHook(() =>
      useProductListController({ scopeToWarehouse: true })
    );
    expect(fetchProducts).not.toHaveBeenCalled();
    expect(result.current.filtered).toEqual([]);
  });

  it('fetches scoped products once a warehouse is set', async () => {
    useCartStore.setState({ warehouse: { id: 'w5' } });
    await renderHook(() => useProductListController({ scopeToWarehouse: true }));
    await waitFor(() => expect(fetchProducts).toHaveBeenCalledWith('w5'));
  });
});
