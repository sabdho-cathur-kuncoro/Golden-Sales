import { renderHook, act, waitFor } from '@testing-library/react-native';

jest.mock('@/services/sale.services', () => ({
  getSellHistoryService: jest.fn(),
  getSellHistoryDetailService: jest.fn(),
}));
jest.mock('@/hooks/useToast', () => {
  const warning = jest.fn();
  const success = jest.fn();
  const error = jest.fn();
  const info = jest.fn();
  return { useToast: () => ({ warning, success, error, info }) };
});

import {
  getSellHistoryService,
  getSellHistoryDetailService,
} from '@/services/sale.services';
import { useToast } from '@/hooks/useToast';
import useSalesHistory from './useSalesHistory';

const getHistory = getSellHistoryService as jest.Mock;
const getHistoryDetail = getSellHistoryDetailService as jest.Mock;
const warning = useToast().warning as jest.Mock;

const page = (rows: any[], totalPages = 1, totalRecords = rows.length) => ({
  data: rows,
  totalPages,
  totalRecords,
});

beforeEach(() => {
  jest.clearAllMocks();
  getHistory.mockResolvedValue(page([]));
  getHistoryDetail.mockResolvedValue({});
});

describe('useSalesHistory', () => {
  it('loads page 1 on mount, clears loading, defaults a 30-day range', async () => {
    getHistory.mockResolvedValueOnce(page([{ saleNumber: 'S1', total: 100, itemCount: 2 }], 1, 1));
    const { result } = await renderHook(() => useSalesHistory());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.sales).toHaveLength(1);
    expect(result.current.totalRecords).toBe(1);
    expect(result.current.isFilterActive).toBe(false);
    expect(getHistory.mock.calls[0][0]).toMatchObject({ page: 1, pageSize: 10 });
  });

  it('summary sums itemCount + total across loaded rows', async () => {
    getHistory.mockResolvedValueOnce(
      page([
        { saleNumber: 'S1', total: 100, itemCount: 2 },
        { saleNumber: 'S2', total: 50, itemCount: 3 },
      ], 1, 2)
    );
    const { result } = await renderHook(() => useSalesHistory());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.summary).toEqual({ itemCount: 5, totalNominal: 150 });
  });

  it('sets error + warns when the page fetch rejects', async () => {
    getHistory.mockRejectedValueOnce(new Error('boom'));
    const { result } = await renderHook(() => useSalesHistory());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('boom');
    expect(warning).toHaveBeenCalledWith('Perhatian', 'boom');
    expect(result.current.sales).toEqual([]);
  });

  it('loadMore appends the next page', async () => {
    getHistory.mockResolvedValueOnce(page([{ saleNumber: 'S1' }], 2, 2));
    const { result } = await renderHook(() => useSalesHistory());
    await waitFor(() => expect(result.current.loading).toBe(false));
    getHistory.mockResolvedValueOnce(page([{ saleNumber: 'S2' }], 2, 2));
    await act(async () => {
      await result.current.loadMore();
    });
    expect(result.current.sales.map((s) => s.saleNumber)).toEqual(['S1', 'S2']);
    expect(getHistory.mock.calls[1][0]).toMatchObject({ page: 2 });
    expect(result.current.loadingMore).toBe(false);
  });

  it('loadMore is a no-op on the last page', async () => {
    getHistory.mockResolvedValueOnce(page([{ saleNumber: 'S1' }], 1, 1));
    const { result } = await renderHook(() => useSalesHistory());
    await waitFor(() => expect(result.current.loading).toBe(false));
    getHistory.mockClear();
    await act(async () => {
      await result.current.loadMore();
    });
    expect(getHistory).not.toHaveBeenCalled();
  });

  it('setSearch resets the list and refetches with the term', async () => {
    const { result } = await renderHook(() => useSalesHistory());
    await waitFor(() => expect(result.current.loading).toBe(false));
    getHistory.mockClear();
    await act(async () => {
      result.current.setSearch('ref-9');
    });
    await waitFor(() =>
      expect(getHistory.mock.calls[0][0]).toMatchObject({ search: 'ref-9', page: 1 })
    );
    expect(result.current.search).toBe('ref-9');
  });

  it('setDateRange marks the filter active and refetches', async () => {
    const { result } = await renderHook(() => useSalesHistory());
    await waitFor(() => expect(result.current.loading).toBe(false));
    getHistory.mockClear();
    await act(async () => {
      result.current.setDateRange('2026-01-01', '2026-01-31');
    });
    await waitFor(() =>
      expect(getHistory.mock.calls[0][0]).toMatchObject({
        from: '2026-01-01',
        to: '2026-01-31',
      })
    );
    expect(result.current.isFilterActive).toBe(true);
  });

  it('toggleExpand fetches + caches row detail; second toggle collapses', async () => {
    const { result } = await renderHook(() => useSalesHistory());
    await waitFor(() => expect(result.current.loading).toBe(false));
    getHistoryDetail.mockResolvedValueOnce({ sn: ['A', 'B'] });
    await act(async () => {
      await result.current.toggleExpand('S1');
    });
    expect(result.current.expanded).toBe('S1');
    expect(result.current.detailCache.S1).toEqual({ sn: ['A', 'B'] });
    expect(getHistoryDetail).toHaveBeenCalledWith('S1');
    await act(async () => {
      await result.current.toggleExpand('S1');
    });
    expect(result.current.expanded).toBeNull();
  });

  it('toggleExpand stores an error marker when detail fetch fails', async () => {
    const { result } = await renderHook(() => useSalesHistory());
    await waitFor(() => expect(result.current.loading).toBe(false));
    getHistoryDetail.mockRejectedValueOnce(new Error('detail-fail'));
    await act(async () => {
      await result.current.toggleExpand('S9');
    });
    expect(result.current.detailCache.S9).toEqual({ error: 'detail-fail' });
    expect(result.current.detailLoading).toBe(false);
  });
});
