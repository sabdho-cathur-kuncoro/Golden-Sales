import { renderHook, act, waitFor } from '@testing-library/react-native';

jest.mock('@/services/sale.services', () => ({
  getCustomerDetailService: jest.fn(),
  requestCustomerStatusService: jest.fn(),
}));
jest.mock('@/hooks/useToast', () => {
  const warning = jest.fn();
  const success = jest.fn();
  const error = jest.fn();
  const info = jest.fn();
  return { useToast: () => ({ warning, success, error, info }) };
});

import {
  getCustomerDetailService,
  requestCustomerStatusService,
} from '@/services/sale.services';
import { useToast } from '@/hooks/useToast';
import useCustomerDetail from './useCustomerDetail';

const getDetail = getCustomerDetailService as jest.Mock;
const requestStatus = requestCustomerStatusService as jest.Mock;
const t = useToast();
const warning = t.warning as jest.Mock;
const success = t.success as jest.Mock;
const error = t.error as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  getDetail.mockResolvedValue(null);
  requestStatus.mockResolvedValue({});
});

describe('useCustomerDetail', () => {
  it('loads /customers/:id on mount and clears loading', async () => {
    getDetail.mockResolvedValueOnce({ id: 5, name: 'Toko A' });
    const { result } = await renderHook(() => useCustomerDetail(5));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(getDetail).toHaveBeenCalledWith(5);
    expect(result.current.data).toEqual({ id: 5, name: 'Toko A' });
    expect(result.current.error).toBe('');
  });

  it('sets error + warns when the detail fetch rejects', async () => {
    getDetail.mockRejectedValueOnce(new Error('404'));
    const { result } = await renderHook(() => useCustomerDetail(5));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe('404');
    expect(warning).toHaveBeenCalledWith('Perhatian', '404');
  });

  it('submitStatusRequest rejects an empty reason without calling the service', async () => {
    const { result } = await renderHook(() => useCustomerDetail(5));
    await waitFor(() => expect(result.current.loading).toBe(false));
    let ret: boolean | undefined;
    await act(async () => {
      ret = await result.current.submitStatusRequest('Inactive', '   ');
    });
    expect(ret).toBe(false);
    expect(requestStatus).not.toHaveBeenCalled();
    expect(warning).toHaveBeenCalledWith('Perhatian', 'Alasan wajib diisi.');
  });

  it('submitStatusRequest posts, toasts success, refetches and returns true', async () => {
    const { result } = await renderHook(() => useCustomerDetail(5));
    await waitFor(() => expect(result.current.loading).toBe(false));
    getDetail.mockClear();
    let ret: boolean | undefined;
    await act(async () => {
      ret = await result.current.submitStatusRequest('Inactive', ' alasan ');
    });
    expect(ret).toBe(true);
    expect(requestStatus).toHaveBeenCalledWith(5, {
      newStatus: 'Inactive',
      reason: 'alasan',
    });
    expect(success).toHaveBeenCalled();
    // refetch after success
    expect(getDetail).toHaveBeenCalled();
    expect(result.current.submitting).toBe(false);
  });

  it('submitStatusRequest returns false + toasts error when the service rejects', async () => {
    requestStatus.mockRejectedValueOnce(new Error('denied'));
    const { result } = await renderHook(() => useCustomerDetail(5));
    await waitFor(() => expect(result.current.loading).toBe(false));
    let ret: boolean | undefined;
    await act(async () => {
      ret = await result.current.submitStatusRequest('Inactive', 'ok');
    });
    expect(ret).toBe(false);
    expect(error).toHaveBeenCalledWith('Gagal', 'denied');
    expect(result.current.submitting).toBe(false);
  });
});
