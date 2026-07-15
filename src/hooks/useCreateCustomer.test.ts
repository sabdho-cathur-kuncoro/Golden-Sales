import { renderHook, act, waitFor } from '@testing-library/react-native';

jest.mock('@/services/sale.services', () => ({
  getSalesWarehousesService: jest.fn(),
  checkCustomerCodeService: jest.fn(),
  checkCustomerPhoneService: jest.fn(),
  createCustomerService: jest.fn(),
}));
jest.mock('@/hooks/useToast', () => {
  const warning = jest.fn();
  const success = jest.fn();
  const error = jest.fn();
  const info = jest.fn();
  return { useToast: () => ({ warning, success, error, info }) };
});

import {
  getSalesWarehousesService,
  checkCustomerCodeService,
  checkCustomerPhoneService,
  createCustomerService,
} from '@/services/sale.services';
import { useToast } from '@/hooks/useToast';
import useCreateCustomer from './useCreateCustomer';

const getWh = getSalesWarehousesService as jest.Mock;
const checkCode = checkCustomerCodeService as jest.Mock;
const checkPhone = checkCustomerPhoneService as jest.Mock;
const createCustomer = createCustomerService as jest.Mock;
const error = useToast().error as jest.Mock;

// Fill a valid form so submit reaches the POST. Uses setField for each key.
const fillValid = async (result: any) => {
  await act(async () => {
    result.current.setField('customerCode', 'ABC');
    result.current.setField('customerName', 'Toko A');
    result.current.setField('phone', '0812');
  });
};

beforeEach(() => {
  jest.clearAllMocks();
  getWh.mockResolvedValue([]);
  createCustomer.mockResolvedValue({ message: 'ok' });
});

describe('useCreateCustomer', () => {
  it('initial state: empty form, warehouses loading', async () => {
    getWh.mockReturnValueOnce(new Promise(() => {})); // never resolves
    const { result } = await renderHook(() => useCreateCustomer());
    expect(result.current.form.customerCode).toBe('');
    expect(result.current.whLoading).toBe(true);
    expect(result.current.warehouses).toEqual([]);
  });

  it('loads warehouses and auto-locks when there is exactly one', async () => {
    getWh.mockResolvedValueOnce([{ id: 42, name: 'Gudang' }]);
    const { result } = await renderHook(() => useCreateCustomer());
    await waitFor(() => expect(result.current.whLoading).toBe(false));
    expect(result.current.warehouses).toHaveLength(1);
    expect(result.current.form.warehouseId).toBe('42');
  });

  it('does not auto-lock when multiple warehouses exist', async () => {
    getWh.mockResolvedValueOnce([{ id: 1 }, { id: 2 }]);
    const { result } = await renderHook(() => useCreateCustomer());
    await waitFor(() => expect(result.current.whLoading).toBe(false));
    expect(result.current.form.warehouseId).toBe('');
  });

  it('falls back to empty warehouses when the fetch fails', async () => {
    getWh.mockRejectedValueOnce(new Error('down'));
    const { result } = await renderHook(() => useCreateCustomer());
    await waitFor(() => expect(result.current.whLoading).toBe(false));
    expect(result.current.warehouses).toEqual([]);
  });

  it('setField updates a single form key', async () => {
    const { result } = await renderHook(() => useCreateCustomer());
    await act(async () => {
      result.current.setField('customerName', 'Budi');
    });
    expect(result.current.form.customerName).toBe('Budi');
  });

  describe('debounced availability checks', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    it('onCodeChange uppercases + marks checking, then available after 500ms', async () => {
      checkCode.mockResolvedValueOnce({ available: true, message: 'bebas' });
      const { result } = await renderHook(() => useCreateCustomer());
      await act(async () => {
        result.current.onCodeChange('abc');
      });
      expect(result.current.form.customerCode).toBe('ABC');
      expect(result.current.codeStatus).toBe('checking');
      await act(async () => {
        jest.advanceTimersByTime(500);
      });
      await waitFor(() => expect(result.current.codeStatus).toBe('available'));
      expect(checkCode).toHaveBeenCalledWith('ABC');
      expect(result.current.codeMessage).toBe('bebas');
    });

    it('onPhoneChange marks taken when the number is unavailable', async () => {
      checkPhone.mockResolvedValueOnce({ available: false, message: 'dipakai' });
      const { result } = await renderHook(() => useCreateCustomer());
      await act(async () => {
        result.current.onPhoneChange('0812');
      });
      await act(async () => {
        jest.advanceTimersByTime(500);
      });
      await waitFor(() => expect(result.current.phoneStatus).toBe('taken'));
      expect(result.current.phoneMessage).toBe('dipakai');
    });
  });

  it('submit fails validation (no code) and returns null + sets error', async () => {
    const { result } = await renderHook(() => useCreateCustomer());
    await waitFor(() => expect(result.current.whLoading).toBe(false));
    let ret: string | null | undefined;
    await act(async () => {
      ret = await result.current.submit();
    });
    expect(ret).toBeNull();
    expect(result.current.error).toBe('Customer Code wajib.');
    expect(createCustomer).not.toHaveBeenCalled();
  });

  it('submit posts a valid form and returns the success message', async () => {
    createCustomer.mockResolvedValueOnce({ message: 'terkirim' });
    const { result } = await renderHook(() => useCreateCustomer());
    await waitFor(() => expect(result.current.whLoading).toBe(false));
    await fillValid(result);
    let ret: string | null | undefined;
    await act(async () => {
      ret = await result.current.submit();
    });
    expect(ret).toBe('terkirim');
    expect(createCustomer).toHaveBeenCalledTimes(1);
    // warehouseId "" → null in payload
    expect(createCustomer.mock.calls[0][0]).toMatchObject({
      customerCode: 'ABC',
      warehouseId: null,
    });
    expect(result.current.submitting).toBe(false);
  });

  it('submit returns null + toasts error when the POST rejects', async () => {
    createCustomer.mockRejectedValueOnce(new Error('server'));
    const { result } = await renderHook(() => useCreateCustomer());
    await waitFor(() => expect(result.current.whLoading).toBe(false));
    await fillValid(result);
    let ret: string | null | undefined;
    await act(async () => {
      ret = await result.current.submit();
    });
    expect(ret).toBeNull();
    expect(error).toHaveBeenCalledWith('Gagal', 'server');
    expect(result.current.error).toBe('server');
  });
});
