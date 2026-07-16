// Smoke: Transaksi-detail screen. It loads the order + timeline on mount; mock
// the order service to resolve null so it settles into the not-found state (the
// header renders in every state and is the stable anchor).
jest.mock('@/services/orders.services', () => ({
  getDetailOrdersService: jest.fn(async () => null),
  getOrderTimelineService: jest.fn(async () => ({ events: [] })),
  completeOrderService: jest.fn(async () => ({})),
}));
jest.mock('@/services/approval.services', () => ({
  onDeleteApprovalService: jest.fn(async () => ({})),
}));
jest.mock('@/hooks/useToast', () => {
  const warning = jest.fn();
  const success = jest.fn();
  const error = jest.fn();
  const info = jest.fn();
  return { useToast: () => ({ warning, success, error, info }) };
});
// The global confirm modal isn't mounted in tests — auto-confirm immediately.
jest.mock('@/stores/confirm.store', () => ({
  useConfirmStore: (sel: any) => sel({ show: (cfg: any) => cfg.onConfirm?.() }),
}));

import { act, fireEvent, render, screen } from '@testing-library/react-native';
import {
  completeOrderService,
  getDetailOrdersService,
} from '@/services/orders.services';
import { useToast } from '@/hooks/useToast';
import TransaksiDetail from './index';

const getDetail = getDetailOrdersService as jest.Mock;
const complete = completeOrderService as jest.Mock;
const toastSuccess = useToast().success as jest.Mock;
const toastError = useToast().error as jest.Mock;

beforeEach(() => jest.clearAllMocks());

const dikirimOrder = {
  id: 7,
  orderNumber: 'ORD-007',
  status: 'Dikirim',
  createdAt: '2026-07-01T10:00:00Z',
  items: [],
  total: 10000,
};

describe('Transaksi-detail screen', () => {
  it('renders the detail header and settles', async () => {
    getDetail.mockResolvedValueOnce(null);
    await render(<TransaksiDetail />);
    expect(screen.getAllByText('Detail Transaksi').length).toBeGreaterThan(0);
    expect(await screen.findByText('Pesanan tidak ditemukan')).toBeTruthy();
  });

  it('shows an error toast when complete returns success:false', async () => {
    getDetail.mockResolvedValue(dikirimOrder);
    complete.mockResolvedValueOnce({
      success: false,
      message: 'Stok tidak valid',
    });
    await render(<TransaksiDetail />);
    await screen.findByText('Selesaikan Pesanan');
    // act-wrap the press so the async onConfirm chain (incl. the final
    // setCompleting(false)) settles inside act — avoids the act() warning.
    await act(async () => {
      fireEvent.press(screen.getByText('Selesaikan Pesanan'));
    });
    expect(complete).toHaveBeenCalledTimes(1);
    expect(toastError).toHaveBeenCalledWith('Gagal', 'Stok tidak valid');
    expect(toastSuccess).not.toHaveBeenCalled();
  });

  it('shows a success toast when complete succeeds', async () => {
    getDetail.mockResolvedValue(dikirimOrder);
    complete.mockResolvedValueOnce({
      success: true,
      message: 'Pesanan diselesaikan.',
      snInserted: 3,
    });
    await render(<TransaksiDetail />);
    await screen.findByText('Selesaikan Pesanan');
    await act(async () => {
      fireEvent.press(screen.getByText('Selesaikan Pesanan'));
    });
    expect(toastSuccess).toHaveBeenCalledWith(
      'Berhasil',
      'Pesanan diselesaikan. 3 item masuk ke stock.'
    );
    expect(toastError).not.toHaveBeenCalled();
  });
});
