import { renderHook, act, waitFor } from '@testing-library/react-native';

jest.mock('@/services/sale.services', () => ({
  getCustomersService: jest.fn(),
  getPendingRegistrationsService: jest.fn(),
}));
jest.mock('@/hooks/useToast', () => {
  const warning = jest.fn();
  const success = jest.fn();
  const error = jest.fn();
  const info = jest.fn();
  return { useToast: () => ({ warning, success, error, info }) };
});

import {
  getCustomersService,
  getPendingRegistrationsService,
} from '@/services/sale.services';
import { useToast } from '@/hooks/useToast';
import useCustomers from './useCustomers';

const getCustomers = getCustomersService as jest.Mock;
const getPending = getPendingRegistrationsService as jest.Mock;
const warning = useToast().warning as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  getCustomers.mockResolvedValue([]);
  getPending.mockResolvedValue([]);
});

describe('useCustomers', () => {
  it('exposes STATUS_OPTIONS with a "Semua" default', async () => {
    const { result } = await renderHook(() => useCustomers());
    expect(result.current.STATUS_OPTIONS[0]).toEqual({ value: '', label: 'Semua' });
  });

  it('loads rows + pending regs on mount and clears loading', async () => {
    getCustomers.mockResolvedValueOnce([{ id: 1 }]);
    getPending.mockResolvedValueOnce([{ id: 99 }]);
    const { result } = await renderHook(() => useCustomers());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.rows).toEqual([{ id: 1 }]);
    expect(result.current.pendingRegs).toEqual([{ id: 99 }]);
    expect(result.current.error).toBe('');
  });

  it('passes q + status (undefined when empty) to the service', async () => {
    await renderHook(() => useCustomers());
    await waitFor(() => expect(getCustomers).toHaveBeenCalled());
    expect(getCustomers).toHaveBeenCalledWith({ q: undefined, status: undefined });
  });

  it('sets error + warns when the customer fetch rejects', async () => {
    getCustomers.mockRejectedValueOnce(new Error('down'));
    const { result } = await renderHook(() => useCustomers());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('down');
    expect(warning).toHaveBeenCalledWith('Perhatian', 'down');
    expect(result.current.rows).toEqual([]);
  });

  it('keeps pendingRegs empty (best-effort) when only the pending fetch fails', async () => {
    getCustomers.mockResolvedValueOnce([{ id: 1 }]);
    getPending.mockRejectedValueOnce(new Error('pending down'));
    const { result } = await renderHook(() => useCustomers());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.rows).toEqual([{ id: 1 }]);
    expect(result.current.pendingRegs).toEqual([]);
    expect(result.current.error).toBe('');
  });

  it('refetches with the new search term when setSearch changes it', async () => {
    const { result } = await renderHook(() => useCustomers());
    await waitFor(() => expect(result.current.loading).toBe(false));
    getCustomers.mockClear();
    await act(async () => {
      result.current.setSearch('budi');
    });
    await waitFor(() =>
      expect(getCustomers).toHaveBeenCalledWith({ q: 'budi', status: undefined })
    );
    expect(result.current.search).toBe('budi');
  });

  it('onRefresh toggles refreshing and re-fetches', async () => {
    const { result } = await renderHook(() => useCustomers());
    await waitFor(() => expect(result.current.loading).toBe(false));
    getCustomers.mockClear();
    await act(async () => {
      await result.current.onRefresh();
    });
    expect(getCustomers).toHaveBeenCalledTimes(1);
    expect(result.current.refreshing).toBe(false);
  });
});
