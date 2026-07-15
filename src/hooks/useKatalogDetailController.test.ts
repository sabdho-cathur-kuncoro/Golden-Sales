// Katalog detail controller — browsing-only: load on mount + pull-to-refresh.
jest.mock('@/hooks/useProducts', () => ({ __esModule: true, default: jest.fn() }));

import { act, renderHook, waitFor } from '@testing-library/react-native';
import useProducts from '@/hooks/useProducts';
import { useCartStore } from '@/stores/cart.store';
import useKatalogDetailController from './useKatalogDetailController';

const useProductsMock = useProducts as unknown as jest.Mock;
const fetchProductDetail = jest.fn();

const seed = (detail: any) =>
  useProductsMock.mockReturnValue({
    productDetail: detail,
    detailLoading: false,
    imgList: [],
    imgView: null,
    stockList: [],
    setImagetoView: jest.fn(),
    fetchProductDetail,
  });

beforeEach(() => {
  jest.clearAllMocks();
  useCartStore.setState({ warehouse: { id: 'w9' } });
  seed({ id: 3, category: 'Aksesoris', activePromos: [] });
});

describe('useKatalogDetailController', () => {
  it('fetches the detail scoped to the current warehouse on mount', async () => {
    await renderHook(() => useKatalogDetailController(3));
    await waitFor(() => expect(fetchProductDetail).toHaveBeenCalledWith('3', 'w9'));
  });

  it('derives isKartuPerdana + promos', async () => {
    seed({ id: 3, category: 'Kartu Perdana Axis', activePromos: [{ minQty: 2 }] });
    const { result } = await renderHook(() => useKatalogDetailController(3));
    expect(result.current.isKartuPerdana).toBe(true);
    expect(result.current.promos).toEqual([{ minQty: 2 }]);
  });

  it('onRefresh toggles refreshing and refetches after the delay', async () => {
    jest.useFakeTimers();
    const { result } = await renderHook(() => useKatalogDetailController(3));
    fetchProductDetail.mockClear();

    await act(async () => {
      result.current.onRefresh();
    });
    expect(result.current.refreshing).toBe(true);

    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    await waitFor(() => expect(result.current.refreshing).toBe(false));
    expect(fetchProductDetail).toHaveBeenCalledWith('3', 'w9');
    jest.useRealTimers();
  });
});
