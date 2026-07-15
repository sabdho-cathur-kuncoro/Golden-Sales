// Order detail controller — warehouse guard + qty/serial selection + add-to-cart.
// Mock useProducts (data + fetch spy) and useToast; drive the real cart store
// (override setQty/addSerial with spies); router is globally mocked.
jest.mock('@/hooks/useProducts', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@/hooks/useToast', () => {
  const t = { success: jest.fn(), error: jest.fn(), warning: jest.fn(), info: jest.fn() };
  return { __esModule: true, useToast: () => t };
});

import { act, renderHook, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import useProducts from '@/hooks/useProducts';
import { useToast } from '@/hooks/useToast';
import { useCartStore } from '@/stores/cart.store';
import useOrderDetailController from './useOrderDetailController';

const useProductsMock = useProducts as unknown as jest.Mock;
const toast = useToast();
const fetchProductDetail = jest.fn();
const setQty = jest.fn();
const addSerial = jest.fn();

const baseDetail = {
  id: 7,
  uid: 'UID7',
  productName: 'Kartu Biasa',
  category: 'Aksesoris',
  price: 1000,
  stock: 5,
  activePromos: [],
  imageList: [{ imageBase64: 'x', contentType: 'image/png' }],
};

const seedProducts = (detail: any = baseDetail) =>
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
  useCartStore.setState({ items: [], warehouse: { id: 'w1' }, setQty, addSerial });
  seedProducts();
});

describe('useOrderDetailController', () => {
  it('redirects to /order when no warehouse is locked', async () => {
    useCartStore.setState({ warehouse: null });
    await renderHook(() => useOrderDetailController('UID7'));
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/order'));
    expect(fetchProductDetail).not.toHaveBeenCalled();
  });

  it('fetches warehouse-scoped detail on mount', async () => {
    await renderHook(() => useOrderDetailController('UID7'));
    await waitFor(() =>
      expect(fetchProductDetail).toHaveBeenCalledWith('UID7', 'w1')
    );
  });

  it('flags kartu perdana products from the category', async () => {
    seedProducts({ ...baseDetail, category: 'Kartu Perdana XL' });
    const { result } = await renderHook(() => useOrderDetailController('UID7'));
    expect(result.current.isKartuPerdana).toBe(true);
  });

  it('onChangeQty warns and ignores values over stock', async () => {
    const { result } = await renderHook(() => useOrderDetailController('UID7'));
    await act(async () => result.current.onChangeQty(99));
    expect(toast.warning).toHaveBeenCalled();
    expect(result.current.qty).toBe(1); // unchanged
  });

  it('handleAddToCart (non-serial) calls setQty then routes back', async () => {
    const { result } = await renderHook(() => useOrderDetailController('UID7'));
    await act(async () => result.current.handleAddToCart());
    expect(setQty).toHaveBeenCalledWith(expect.objectContaining({ id: 7 }), 1);
    expect(router.back).toHaveBeenCalled();
    expect(addSerial).not.toHaveBeenCalled();
  });

  it('handleAddToCart (kartu perdana) warns when no serial picked', async () => {
    seedProducts({ ...baseDetail, category: 'Kartu Perdana' });
    const { result } = await renderHook(() => useOrderDetailController('UID7'));
    await act(async () => result.current.handleAddToCart());
    expect(toast.warning).toHaveBeenCalled();
    expect(addSerial).not.toHaveBeenCalled();
  });

  it('handleAddToCart (kartu perdana) addSerial with chosen serials', async () => {
    seedProducts({ ...baseDetail, category: 'Kartu Perdana' });
    const { result } = await renderHook(() => useOrderDetailController('UID7'));
    await act(async () => result.current.toggleSerial('SN1'));
    await act(async () => result.current.handleAddToCart());
    expect(addSerial).toHaveBeenCalledWith(
      expect.objectContaining({ id: 7 }),
      ['SN1']
    );
    expect(router.back).toHaveBeenCalled();
  });
});
