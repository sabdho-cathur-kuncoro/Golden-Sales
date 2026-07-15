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

import { render, screen } from '@testing-library/react-native';
import TransaksiDetail from './index';

describe('Transaksi-detail screen', () => {
  it('renders the detail header and settles', async () => {
    await render(<TransaksiDetail />);
    expect(screen.getAllByText('Detail Transaksi').length).toBeGreaterThan(0);
    expect(await screen.findByText('Pesanan tidak ditemukan')).toBeTruthy();
  });
});
