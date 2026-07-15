// Controller combines useCart data/actions + confirm store + toast + router.
// Mock useCart (controllable items + spy actions) and useToast (stable spies);
// use the real confirm store; router is globally mocked.
jest.mock('@/hooks/useCart', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@/hooks/useToast', () => {
  const t = { success: jest.fn(), error: jest.fn(), warning: jest.fn(), info: jest.fn() };
  return { __esModule: true, useToast: () => t };
});

import { act, renderHook } from '@testing-library/react-native';
import { router } from 'expo-router';
import useCart from '@/hooks/useCart';
import { useToast } from '@/hooks/useToast';
import { useConfirmStore } from '@/stores/confirm.store';
import useCartController from './useCartController';

const useCartMock = useCart as unknown as jest.Mock;
const toast = useToast();

const setQty = jest.fn();
const remove = jest.fn();
const removeSerial = jest.fn();
const refresh = jest.fn().mockResolvedValue(undefined);

// Simple promo-free line math for the mock.
const lineInfo = (i: any) => ({
  subtotal: (Number(i.salesPrice) || 0) * (i.quantity || 0),
  discountPerUnit: 0,
});

beforeEach(() => {
  jest.clearAllMocks();
  useConfirmStore.setState({ visible: false, options: {} });
  useCartMock.mockReturnValue({
    items: [
      { productId: 1, productName: 'A', salesPrice: 100, quantity: 2, stock: 5 },
      { productId: 2, productName: 'B', salesPrice: 50, quantity: 2, stock: 2 },
    ],
    setQty,
    remove,
    removeSerial,
    lineInfo,
    refresh,
  });
});

describe('useCartController selection', () => {
  it('selects everything by default', async () => {
    const { result } = await renderHook(() => useCartController());
    expect(result.current.allSelected).toBe(true);
    expect(result.current.selectedItems).toHaveLength(2);
    expect(result.current.selectedTotal).toBe(300); // 200 + 100
  });

  it('toggleSelect deselects a line', async () => {
    const { result } = await renderHook(() => useCartController());
    const item = { productId: 1, quantity: 2, salesPrice: 100 };
    await act(async () => result.current.toggleSelect(item));
    expect(result.current.isSelected(item)).toBe(false);
    expect(result.current.allSelected).toBe(false);
  });
});

describe('useCartController quantity', () => {
  it('onInc increments within stock', async () => {
    const { result } = await renderHook(() => useCartController());
    await act(async () => result.current.onInc({ productId: 1, quantity: 2, stock: 5 }));
    expect(setQty).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }), 3);
  });

  it('onInc warns and does not setQty past stock', async () => {
    const { result } = await renderHook(() => useCartController());
    await act(async () => result.current.onInc({ productId: 2, quantity: 2, stock: 2 }));
    expect(toast.warning).toHaveBeenCalled();
    expect(setQty).not.toHaveBeenCalled();
  });

  it('onDec clamps at 1 (never deletes)', async () => {
    const { result } = await renderHook(() => useCartController());
    await act(async () => result.current.onDec({ productId: 1, quantity: 1 }));
    expect(setQty).not.toHaveBeenCalled();
  });

  it('onChangeQty returns false and warns when over stock', async () => {
    const { result } = await renderHook(() => useCartController());
    let ok = true;
    await act(async () => {
      ok = result.current.onChangeQty({ productId: 2, stock: 2 }, 9);
    });
    expect(ok).toBe(false);
    expect(setQty).not.toHaveBeenCalled();
  });
});

describe('useCartController delete + checkout', () => {
  it('handleDelete opens a confirm whose onConfirm removes the line', async () => {
    const { result } = await renderHook(() => useCartController());
    await act(async () => result.current.handleDelete({ productId: 1, productName: 'A' }));
    const opts = useConfirmStore.getState().options;
    expect(opts.type).toBe('danger');
    await act(async () => {
      await opts.onConfirm!();
    });
    expect(remove).toHaveBeenCalledWith(1);
  });

  it('handleCheckout warns when nothing selected', async () => {
    useCartMock.mockReturnValue({
      items: [],
      setQty,
      remove,
      removeSerial,
      lineInfo,
      refresh,
    });
    const { result } = await renderHook(() => useCartController());
    await act(async () => result.current.handleCheckout());
    expect(toast.warning).toHaveBeenCalled();
    expect(router.push).not.toHaveBeenCalled();
  });

  it('handleCheckout routes to /checkout when items are selected', async () => {
    const { result } = await renderHook(() => useCartController());
    await act(async () => result.current.handleCheckout());
    expect(router.push).toHaveBeenCalledWith('/checkout');
  });
});
