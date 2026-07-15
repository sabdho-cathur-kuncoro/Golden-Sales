// Scan / Penjualan controller — SN validation + sell cart + stock + submit.
// Local vision-camera mock ADDS useCameraFormat (missing from the global
// jest.setup.js vision-camera mock — see report). sale.services is mocked;
// the confirm + toast stores are the real singletons.
jest.mock('react-native-vision-camera', () => ({
  __esModule: true,
  useCameraDevice: () => ({ id: 'back' }),
  useCameraFormat: () => ({ maxFps: 30 }),
  useCodeScanner: (cfg: any) => cfg,
}));
// The global expo-router mock does not export useIsFocused (the hook imports it
// from expo-router, not @react-navigation/native — see report). Local mock adds it.
jest.mock('expo-router', () => ({
  __esModule: true,
  useIsFocused: () => true,
  router: { push: jest.fn(), back: jest.fn(), replace: jest.fn() },
}));
jest.mock('@/services/sale.services', () => ({
  __esModule: true,
  getSellStockService: jest.fn(),
  checkSellService: jest.fn(),
  submitSellService: jest.fn(),
}));
jest.mock('@/hooks/useToast', () => {
  const t = { success: jest.fn(), error: jest.fn(), warning: jest.fn(), info: jest.fn() };
  return { __esModule: true, useToast: () => t };
});

import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useToast } from '@/hooks/useToast';
import {
  checkSellService,
  getSellStockService,
  submitSellService,
} from '@/services/sale.services';
import { useConfirmStore } from '@/stores/confirm.store';
import useScanController from './useScanController';

const getStock = getSellStockService as jest.Mock;
const checkSell = checkSellService as jest.Mock;
const submitSell = submitSellService as jest.Mock;
const toast = useToast();

beforeEach(() => {
  jest.clearAllMocks();
  useConfirmStore.setState({ visible: false, options: {} });
  getStock.mockResolvedValue({ totalQty: 3, groups: [{ productId: 1 }] });
});

describe('useScanController stock load', () => {
  it('loads stock on mount', async () => {
    const { result } = await renderHook(() => useScanController());
    await waitFor(() => expect(result.current.stockLoading).toBe(false));
    expect(getStock).toHaveBeenCalled();
    expect(result.current.stock.totalQty).toBe(3);
  });

  it('surfaces a stock error message', async () => {
    getStock.mockRejectedValueOnce(new Error('boom'));
    const { result } = await renderHook(() => useScanController());
    await waitFor(() => expect(result.current.stockErr).toBe('boom'));
  });
});

describe('useScanController tryAdd', () => {
  it('validates + adds a scanned SN to the sell cart', async () => {
    checkSell.mockResolvedValue({
      success: true,
      item: { sn: 'SN001', productId: 1, productName: 'Kartu', unitPrice: 5000 },
    });
    const { result } = await renderHook(() => useScanController());
    await waitFor(() => expect(result.current.stockLoading).toBe(false));

    await act(async () => {
      await result.current.tryAdd('SN001');
    });
    expect(result.current.cart).toHaveLength(1);
    expect(result.current.cart[0]).toMatchObject({ qr: 'SN001', unitPrice: 5000 });
    expect(result.current.cartTotal).toBe(5000);
  });

  it('dedupes the same SN scanned twice in quick succession', async () => {
    checkSell.mockResolvedValue({
      success: true,
      item: { sn: 'SN002', productId: 1, unitPrice: 1000 },
    });
    const { result } = await renderHook(() => useScanController());
    await waitFor(() => expect(result.current.stockLoading).toBe(false));

    await act(async () => {
      await result.current.tryAdd('SN002');
    });
    await act(async () => {
      await result.current.tryAdd('SN002');
    });
    // Second scan is debounced per-frame → checkSell hit only once, no dup line.
    expect(checkSell).toHaveBeenCalledTimes(1);
    expect(result.current.cart).toHaveLength(1);
  });

  it('warns on an invalid SN', async () => {
    checkSell.mockResolvedValue({ success: false, message: 'SN ditolak' });
    const { result } = await renderHook(() => useScanController());
    await waitFor(() => expect(result.current.stockLoading).toBe(false));
    await act(async () => {
      await result.current.tryAdd('BAD');
    });
    expect(toast.warning).toHaveBeenCalled();
    expect(result.current.cart).toHaveLength(0);
  });
});

describe('useScanController submit', () => {
  it('warns and skips confirm when the cart is empty', async () => {
    const { result } = await renderHook(() => useScanController());
    await waitFor(() => expect(result.current.stockLoading).toBe(false));
    await act(async () => result.current.submit());
    expect(toast.warning).toHaveBeenCalled();
    expect(useConfirmStore.getState().visible).toBe(false);
  });

  it('confirms then submits the sell, clearing the cart on success', async () => {
    checkSell.mockResolvedValue({
      success: true,
      item: { sn: 'SN003', productId: 1, unitPrice: 2000 },
    });
    submitSell.mockResolvedValue({ success: true, totalAmount: 2000, message: 'ok' });
    const { result } = await renderHook(() => useScanController());
    await waitFor(() => expect(result.current.stockLoading).toBe(false));
    await act(async () => {
      await result.current.tryAdd('SN003');
    });

    await act(async () => result.current.submit());
    const opts = useConfirmStore.getState().options;
    expect(opts.onConfirm).toBeDefined();

    await act(async () => {
      await opts.onConfirm!();
    });
    expect(submitSell).toHaveBeenCalledWith(
      expect.objectContaining({
        items: [{ qr: 'SN003', unitPrice: 2000 }],
      })
    );
    await waitFor(() => expect(result.current.cart).toHaveLength(0));
    expect(toast.success).toHaveBeenCalled();
  });
});
