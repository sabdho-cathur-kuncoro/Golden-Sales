import { renderHook, act, waitFor } from '@testing-library/react-native';

jest.mock('@/services/orders.services', () => ({
  getMyOrdersService: jest.fn(),
  completeOrderService: jest.fn(),
}));
jest.mock('@/hooks/useToast', () => {
  const warning = jest.fn();
  const success = jest.fn();
  const error = jest.fn();
  const info = jest.fn();
  return { useToast: () => ({ warning, success, error, info }) };
});

import {
  getMyOrdersService,
  completeOrderService,
} from '@/services/orders.services';
import { useToast } from '@/hooks/useToast';
import useMyOrders, {
  STATUS_OPTIONS,
  REQUEST_STATUS_OPTIONS,
} from './useMyOrders';

const getMyOrders = getMyOrdersService as jest.Mock;
const completeOrder = completeOrderService as jest.Mock;
const warning = useToast().warning as jest.Mock;

const page = (rows: any[], totalPages = 1, totalRecords = rows.length) => ({
  data: rows,
  totalPages,
  totalRecords,
});

beforeEach(() => {
  jest.clearAllMocks();
  getMyOrders.mockResolvedValue(page([]));
  completeOrder.mockResolvedValue({ inserted: 3 });
});

describe('useMyOrders', () => {
  it('loads page 1 on mount and excludes final statuses by default', async () => {
    getMyOrders.mockResolvedValueOnce(page([{ id: 1 }], 1, 1));
    const { result } = await renderHook(() => useMyOrders());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.orders).toEqual([{ id: 1 }]);
    expect(result.current.status).toBe('');
    expect(getMyOrders.mock.calls[0][0]).toMatchObject({
      excludeStatus: 'Selesai,Dibatalkan',
      page: 1,
      pageSize: 10,
    });
    expect(result.current.STATUS_OPTIONS).toBe(STATUS_OPTIONS);
  });

  it('honours opts: initialStatus, excludeStatus="" and custom statusOptions', async () => {
    const { result } = await renderHook(() =>
      useMyOrders({
        initialStatus: 'Selesai,Dibatalkan',
        excludeStatus: '',
        statusOptions: REQUEST_STATUS_OPTIONS,
      })
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.status).toBe('Selesai,Dibatalkan');
    expect(result.current.STATUS_OPTIONS).toBe(REQUEST_STATUS_OPTIONS);
    expect(getMyOrders.mock.calls[0][0]).toMatchObject({
      status: 'Selesai,Dibatalkan',
      excludeStatus: undefined,
    });
  });

  it('sets error + warns when the page fetch rejects', async () => {
    getMyOrders.mockRejectedValueOnce(new Error('boom'));
    const { result } = await renderHook(() => useMyOrders());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('boom');
    expect(warning).toHaveBeenCalledWith('Perhatian', 'boom');
    expect(result.current.orders).toEqual([]);
  });

  it('setStatus resets the list and refetches with the new status', async () => {
    const { result } = await renderHook(() => useMyOrders());
    await waitFor(() => expect(result.current.loading).toBe(false));
    getMyOrders.mockClear();
    await act(async () => {
      result.current.setStatus('Dikirim');
    });
    await waitFor(() =>
      expect(getMyOrders.mock.calls[0][0]).toMatchObject({ status: 'Dikirim' })
    );
    expect(result.current.status).toBe('Dikirim');
  });

  it('loadMore appends the next page', async () => {
    getMyOrders.mockResolvedValueOnce(page([{ id: 1 }], 2, 2));
    const { result } = await renderHook(() => useMyOrders());
    await waitFor(() => expect(result.current.loading).toBe(false));
    getMyOrders.mockResolvedValueOnce(page([{ id: 2 }], 2, 2));
    await act(async () => {
      await result.current.loadMore();
    });
    expect(result.current.orders.map((o) => o.id)).toEqual([1, 2]);
  });

  it('completeOrder POSTs, drops the row locally and returns the result', async () => {
    getMyOrders.mockResolvedValueOnce(page([{ id: 1 }, { id: 2 }], 1, 2));
    completeOrder.mockResolvedValueOnce({ inserted: 5 });
    const { result } = await renderHook(() => useMyOrders());
    await waitFor(() => expect(result.current.loading).toBe(false));
    let res: any;
    await act(async () => {
      res = await result.current.completeOrder(1);
    });
    expect(res).toEqual({ inserted: 5 });
    expect(completeOrder).toHaveBeenCalledWith(1);
    expect(result.current.orders.map((o) => o.id)).toEqual([2]);
    expect(result.current.totalRecords).toBe(1);
    expect(result.current.completingId).toBeNull();
  });

  it('completeOrder clears completingId even when the service throws', async () => {
    completeOrder.mockRejectedValueOnce(new Error('fail'));
    const { result } = await renderHook(() => useMyOrders());
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => {
      await expect(result.current.completeOrder(1)).rejects.toThrow('fail');
    });
    expect(result.current.completingId).toBeNull();
  });
});
