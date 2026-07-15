import { renderHook, act, waitFor } from '@testing-library/react-native';

jest.mock('@/services/orders.services', () => ({
  getOrdersService: jest.fn(),
}));
jest.mock('@/hooks/useToast', () => {
  const warning = jest.fn();
  const success = jest.fn();
  const error = jest.fn();
  const info = jest.fn();
  return { useToast: () => ({ warning, success, error, info }) };
});

import { getOrdersService } from '@/services/orders.services';
import { useToast } from '@/hooks/useToast';
import useApprovalOrders, { STATUS_OPTIONS } from './useApprovalOrders';

const getOrders = getOrdersService as jest.Mock;
const warning = useToast().warning as jest.Mock;

const page = (rows: any[], totalPages = 1, totalRecords = rows.length) => ({
  data: rows,
  totalPages,
  totalRecords,
});

beforeEach(() => {
  jest.clearAllMocks();
  getOrders.mockResolvedValue(page([]));
});

describe('useApprovalOrders', () => {
  it('loads page 1 on mount with the "Menunggu Konfirmasi" default status', async () => {
    getOrders.mockResolvedValueOnce(page([{ id: 1 }], 1, 1));
    const { result } = await renderHook(() => useApprovalOrders());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.orders).toEqual([{ id: 1 }]);
    expect(result.current.status).toBe('Menunggu Konfirmasi');
    expect(result.current.STATUS_OPTIONS).toBe(STATUS_OPTIONS);
    expect(getOrders.mock.calls[0][0]).toMatchObject({
      status: 'Menunggu Konfirmasi',
      page: 1,
      pageSize: 10,
    });
  });

  it('sets error + warns when the page fetch rejects', async () => {
    getOrders.mockRejectedValueOnce(new Error('boom'));
    const { result } = await renderHook(() => useApprovalOrders());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('boom');
    expect(warning).toHaveBeenCalledWith('Perhatian', 'boom');
    expect(result.current.orders).toEqual([]);
  });

  it('setStatus resets the list and refetches with the new status', async () => {
    const { result } = await renderHook(() => useApprovalOrders());
    await waitFor(() => expect(result.current.loading).toBe(false));
    getOrders.mockClear();
    await act(async () => {
      result.current.setStatus('Selesai');
    });
    await waitFor(() =>
      expect(getOrders.mock.calls[0][0]).toMatchObject({ status: 'Selesai' })
    );
    expect(result.current.status).toBe('Selesai');
  });

  it('setStatus is a no-op when the value is unchanged', async () => {
    const { result } = await renderHook(() => useApprovalOrders());
    await waitFor(() => expect(result.current.loading).toBe(false));
    getOrders.mockClear();
    await act(async () => {
      result.current.setStatus('Menunggu Konfirmasi');
    });
    expect(getOrders).not.toHaveBeenCalled();
  });

  it('setSearch resets the list and refetches with the term', async () => {
    const { result } = await renderHook(() => useApprovalOrders());
    await waitFor(() => expect(result.current.loading).toBe(false));
    getOrders.mockClear();
    await act(async () => {
      result.current.setSearch('INV-1');
    });
    await waitFor(() =>
      expect(getOrders.mock.calls[0][0]).toMatchObject({ search: 'INV-1' })
    );
    expect(result.current.search).toBe('INV-1');
  });

  it('loadMore appends the next page and is a no-op on the last', async () => {
    getOrders.mockResolvedValueOnce(page([{ id: 1 }], 2, 2));
    const { result } = await renderHook(() => useApprovalOrders());
    await waitFor(() => expect(result.current.loading).toBe(false));
    getOrders.mockResolvedValueOnce(page([{ id: 2 }], 2, 2));
    await act(async () => {
      await result.current.loadMore();
    });
    expect(result.current.orders.map((o) => o.id)).toEqual([1, 2]);
    // now on last page → no further fetch
    getOrders.mockClear();
    await act(async () => {
      await result.current.loadMore();
    });
    expect(getOrders).not.toHaveBeenCalled();
  });

  it('onRefresh re-fetches page 1 and clears refreshing', async () => {
    const { result } = await renderHook(() => useApprovalOrders());
    await waitFor(() => expect(result.current.loading).toBe(false));
    getOrders.mockClear();
    await act(async () => {
      await result.current.onRefresh();
    });
    expect(getOrders.mock.calls[0][0]).toMatchObject({ page: 1 });
    expect(result.current.refreshing).toBe(false);
  });
});
