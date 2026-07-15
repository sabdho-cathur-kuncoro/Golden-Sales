import { renderHook, act, waitFor } from '@testing-library/react-native';

jest.mock('@/services/sale.services', () => ({
  getReturnHistoryService: jest.fn(),
  getReturnHistoryDetailService: jest.fn(),
}));
jest.mock('@/hooks/useToast', () => {
  const warning = jest.fn();
  const success = jest.fn();
  const error = jest.fn();
  const info = jest.fn();
  return { useToast: () => ({ warning, success, error, info }) };
});

import {
  getReturnHistoryService,
  getReturnHistoryDetailService,
} from '@/services/sale.services';
import { useToast } from '@/hooks/useToast';
import useReturnHistory from './useReturnHistory';

const getHistory = getReturnHistoryService as jest.Mock;
const getHistoryDetail = getReturnHistoryDetailService as jest.Mock;
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

describe('useReturnHistory', () => {
  it('loads page 1 on mount and clears loading', async () => {
    getHistory.mockResolvedValueOnce(page([{ returnNumber: 'R1', total: 20, itemCount: 1 }], 1, 1));
    const { result } = await renderHook(() => useReturnHistory());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.returns).toHaveLength(1);
    expect(result.current.totalRecords).toBe(1);
    expect(getHistory.mock.calls[0][0]).toMatchObject({ page: 1, pageSize: 10 });
  });

  it('summary sums itemCount + total across loaded rows', async () => {
    getHistory.mockResolvedValueOnce(
      page([
        { returnNumber: 'R1', total: 20, itemCount: 1 },
        { returnNumber: 'R2', total: 30, itemCount: 4 },
      ], 1, 2)
    );
    const { result } = await renderHook(() => useReturnHistory());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.summary).toEqual({ itemCount: 5, totalNominal: 50 });
  });

  it('sets error + warns when the page fetch rejects', async () => {
    getHistory.mockRejectedValueOnce(new Error('boom'));
    const { result } = await renderHook(() => useReturnHistory());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('boom');
    expect(warning).toHaveBeenCalledWith('Perhatian', 'boom');
    expect(result.current.returns).toEqual([]);
  });

  it('loadMore appends the next page', async () => {
    getHistory.mockResolvedValueOnce(page([{ returnNumber: 'R1' }], 2, 2));
    const { result } = await renderHook(() => useReturnHistory());
    await waitFor(() => expect(result.current.loading).toBe(false));
    getHistory.mockResolvedValueOnce(page([{ returnNumber: 'R2' }], 2, 2));
    await act(async () => {
      await result.current.loadMore();
    });
    expect(result.current.returns.map((r) => r.returnNumber)).toEqual(['R1', 'R2']);
    expect(getHistory.mock.calls[1][0]).toMatchObject({ page: 2 });
  });

  it('setSearch resets the list and refetches with the term', async () => {
    const { result } = await renderHook(() => useReturnHistory());
    await waitFor(() => expect(result.current.loading).toBe(false));
    getHistory.mockClear();
    await act(async () => {
      result.current.setSearch('ret-3');
    });
    await waitFor(() =>
      expect(getHistory.mock.calls[0][0]).toMatchObject({ search: 'ret-3', page: 1 })
    );
    expect(result.current.returns).toEqual([]);
  });

  it('setDateRange marks the filter active and refetches', async () => {
    const { result } = await renderHook(() => useReturnHistory());
    await waitFor(() => expect(result.current.loading).toBe(false));
    getHistory.mockClear();
    await act(async () => {
      result.current.setDateRange('2026-02-01', '2026-02-28');
    });
    await waitFor(() =>
      expect(getHistory.mock.calls[0][0]).toMatchObject({
        from: '2026-02-01',
        to: '2026-02-28',
      })
    );
    expect(result.current.isFilterActive).toBe(true);
  });

  it('toggleExpand fetches + caches row detail; second toggle collapses', async () => {
    const { result } = await renderHook(() => useReturnHistory());
    await waitFor(() => expect(result.current.loading).toBe(false));
    getHistoryDetail.mockResolvedValueOnce({ sn: ['X'] });
    await act(async () => {
      await result.current.toggleExpand('R1');
    });
    expect(result.current.expanded).toBe('R1');
    expect(result.current.detailCache.R1).toEqual({ sn: ['X'] });
    await act(async () => {
      await result.current.toggleExpand('R1');
    });
    expect(result.current.expanded).toBeNull();
  });

  it('toggleExpand stores an error marker when detail fetch fails', async () => {
    const { result } = await renderHook(() => useReturnHistory());
    await waitFor(() => expect(result.current.loading).toBe(false));
    getHistoryDetail.mockRejectedValueOnce(new Error('detail-fail'));
    await act(async () => {
      await result.current.toggleExpand('R9');
    });
    expect(result.current.detailCache.R9).toEqual({ error: 'detail-fail' });
  });
});
