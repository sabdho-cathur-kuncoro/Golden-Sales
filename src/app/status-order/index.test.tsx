// Smoke: Status-order (timeline) screen. It fetches the order timeline on mount;
// mock the service to resolve empty so the screen settles into its final state.
jest.mock('@/services/orders.services', () => ({
  getOrderTimelineService: jest.fn(async () => ({ events: [] })),
}));

import { render, screen } from '@testing-library/react-native';
import StatusOrder from './index';

describe('Status-order screen', () => {
  it('renders the status header and settles', async () => {
    await render(<StatusOrder />);
    // "Status Transaksi" appears in both the header and the card label.
    expect(screen.getAllByText('Status Transaksi').length).toBeGreaterThan(0);
    // Empty timeline settles to the "no history" state.
    expect(await screen.findByText('Belum ada riwayat')).toBeTruthy();
  });
});
