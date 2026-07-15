import { renderHook, act, waitFor } from '@testing-library/react-native';

jest.mock('@/services/products.services', () => ({
  getProductsCachedService: jest.fn(),
  getDetailProductsService: jest.fn(),
}));
jest.mock('@/storage/product.cache', () => ({
  productsCache: { getUpdatedAt: jest.fn() },
}));
jest.mock('@/hooks/useToast', () => {
  const warning = jest.fn();
  const success = jest.fn();
  const error = jest.fn();
  const info = jest.fn();
  return { useToast: () => ({ warning, success, error, info }) };
});

import {
  getProductsCachedService,
  getDetailProductsService,
} from '@/services/products.services';
import { productsCache } from '@/storage/product.cache';
import { useToast } from '@/hooks/useToast';
import useProducts from './useProducts';

const getProducts = getProductsCachedService as jest.Mock;
const getDetail = getDetailProductsService as jest.Mock;
const getUpdatedAt = productsCache.getUpdatedAt as jest.Mock;
const warning = useToast().warning as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  getUpdatedAt.mockResolvedValue(123);
});

describe('useProducts', () => {
  it('initial state: empty products, not loading', async () => {
    const { result } = await renderHook(() => useProducts());
    expect(result.current.products).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.lastSync).toBeNull();
    expect(result.current.productDetail).toBeNull();
  });

  it('fetchProducts sets products + lastSync and clears loading', async () => {
    const rows = [{ id: 1 }, { id: 2 }];
    getProducts.mockResolvedValueOnce(rows);
    getUpdatedAt.mockResolvedValueOnce(999);
    const { result } = await renderHook(() => useProducts());
    await act(async () => {
      result.current.fetchProducts();
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.products).toEqual(rows);
    expect(result.current.lastSync).toBe(999);
    // no warehouseId → scope "all"
    expect(getUpdatedAt).toHaveBeenCalledWith('all');
  });

  it('fetchProducts uses stringified warehouseId as the cache scope', async () => {
    getProducts.mockResolvedValueOnce([]);
    const { result } = await renderHook(() => useProducts());
    await act(async () => {
      result.current.fetchProducts(7);
    });
    await waitFor(() => expect(getUpdatedAt).toHaveBeenCalledWith('7'));
    expect(getProducts).toHaveBeenCalledWith(7);
  });

  it('fetchProducts coerces a non-array result to []', async () => {
    getProducts.mockResolvedValueOnce({ not: 'array' });
    const { result } = await renderHook(() => useProducts());
    await act(async () => {
      result.current.fetchProducts();
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.products).toEqual([]);
  });

  it('fetchProducts warns on error and leaves products empty', async () => {
    getProducts.mockRejectedValueOnce(new Error('offline'));
    const { result } = await renderHook(() => useProducts());
    await act(async () => {
      result.current.fetchProducts();
    });
    await waitFor(() => expect(warning).toHaveBeenCalled());
    expect(result.current.products).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it('fetchProductDetail sets detail, image list, first image + stock', async () => {
    const detail = {
      id: 'x1',
      imageList: [{ imageBase64: 'AAA' }, { imageBase64: 'BBB' }],
      stockList: [{ wh: 1 }],
    };
    getDetail.mockResolvedValueOnce(detail);
    const { result } = await renderHook(() => useProducts());
    await act(async () => {
      result.current.fetchProductDetail('x1', 5);
    });
    await waitFor(() => expect(result.current.detailLoading).toBe(false));
    expect(result.current.productDetail).toEqual(detail);
    expect(result.current.imgList).toEqual(detail.imageList);
    expect(result.current.imgView).toBe('AAA');
    expect(result.current.stockList).toEqual(detail.stockList);
    expect(getDetail).toHaveBeenCalledWith('x1', 5);
  });

  it('fetchProductDetail warns on error and clears detailLoading', async () => {
    getDetail.mockRejectedValueOnce(new Error('nope'));
    const { result } = await renderHook(() => useProducts());
    await act(async () => {
      result.current.fetchProductDetail('x1');
    });
    await waitFor(() => expect(warning).toHaveBeenCalled());
    expect(result.current.productDetail).toBeNull();
    expect(result.current.detailLoading).toBe(false);
  });

  it('setImagetoView updates the previewed image', async () => {
    const { result } = await renderHook(() => useProducts());
    await act(async () => {
      result.current.setImagetoView('ZZZ');
    });
    expect(result.current.imgView).toBe('ZZZ');
  });
});
