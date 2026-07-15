import { renderHook, act, waitFor } from '@testing-library/react-native';

// Local mocks — inline jest.fn()s in the factory, then import + cast so
// assertions target the exact instances the hook calls (see auth.store.test.ts).
jest.mock('@/services/catalog.services', () => ({
  getCategoriesProduct: jest.fn(),
  getDetailsCategoryProduct: jest.fn(),
}));
jest.mock('@/hooks/useToast', () => {
  const warning = jest.fn();
  const success = jest.fn();
  const error = jest.fn();
  const info = jest.fn();
  return { useToast: () => ({ warning, success, error, info }) };
});

import {
  getCategoriesProduct,
  getDetailsCategoryProduct,
} from '@/services/catalog.services';
import { useToast } from '@/hooks/useToast';
import useCatalog from './useCatalog';

const getCategories = getCategoriesProduct as jest.Mock;
const getDetail = getDetailsCategoryProduct as jest.Mock;
// useToast() returns a fresh object but the fns are stable closures from the factory.
const warning = useToast().warning as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useCatalog', () => {
  it('starts with empty catalog + detail arrays', async () => {
    const { result } = await renderHook(() => useCatalog());
    expect(result.current.catalogItem).toEqual([]);
    expect(result.current.detailCatalogItem).toEqual([]);
  });

  it('fetchCatalog populates catalogItem on success', async () => {
    const cats = [{ id: 1, name: 'A' }];
    getCategories.mockResolvedValueOnce(cats);
    const { result } = await renderHook(() => useCatalog());
    await act(async () => {
      result.current.fetchCatalog();
    });
    await waitFor(() => expect(result.current.catalogItem).toEqual(cats));
    expect(warning).not.toHaveBeenCalled();
  });

  it('fetchCatalog falls back to [] when service returns nullish', async () => {
    getCategories.mockResolvedValueOnce(undefined);
    const { result } = await renderHook(() => useCatalog());
    await act(async () => {
      result.current.fetchCatalog();
    });
    await waitFor(() => expect(getCategories).toHaveBeenCalled());
    expect(result.current.catalogItem).toEqual([]);
  });

  it('fetchCatalog routes errors through toast.warning and keeps data safe', async () => {
    getCategories.mockRejectedValueOnce(new Error('boom'));
    const { result } = await renderHook(() => useCatalog());
    await act(async () => {
      result.current.fetchCatalog();
    });
    await waitFor(() => expect(warning).toHaveBeenCalled());
    expect(warning.mock.calls[0][0]).toBe('Perhatian');
    expect(result.current.catalogItem).toEqual([]);
  });

  it('fetchDetailCatalog populates detailCatalogItem with the id', async () => {
    const detail = [{ id: 9 }];
    getDetail.mockResolvedValueOnce(detail);
    const { result } = await renderHook(() => useCatalog());
    await act(async () => {
      result.current.fetchDetailCatalog(9);
    });
    await waitFor(() => expect(result.current.detailCatalogItem).toEqual(detail));
    expect(getDetail).toHaveBeenCalledWith(9);
  });

  it('fetchDetailCatalog warns on error and leaves detail empty', async () => {
    getDetail.mockRejectedValueOnce(new Error('nope'));
    const { result } = await renderHook(() => useCatalog());
    await act(async () => {
      result.current.fetchDetailCatalog(3);
    });
    await waitFor(() => expect(warning).toHaveBeenCalled());
    expect(result.current.detailCatalogItem).toEqual([]);
  });
});
