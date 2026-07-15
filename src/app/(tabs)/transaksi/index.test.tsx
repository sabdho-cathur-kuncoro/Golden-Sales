// Local mock: the transaksi screen drives its list via useMyOrders, which fetches
// on mount. Stub it to a static empty/loaded shape for a deterministic render.
jest.mock('@/hooks/useMyOrders', () => ({
  __esModule: true,
  default: () => ({
    STATUS_OPTIONS: [{ value: '', label: 'Semua' }],
    status: '',
    setStatus: jest.fn(),
    search: '',
    setSearch: jest.fn(),
    from: null,
    to: null,
    setDateRange: jest.fn(),
    orders: [],
    totalRecords: 0,
    loading: false,
    loadingMore: false,
    refreshing: false,
    error: '',
    loadMore: jest.fn(),
    onRefresh: jest.fn(),
    completeOrder: jest.fn(),
    completingId: null,
  }),
}));

import { render, screen } from '@testing-library/react-native';
import Transaksi from './index';

describe('Transaksi screen', () => {
  it('mounts and shows the header', async () => {
    await render(<Transaksi />);
    expect(screen.getByText('Transaksi')).toBeTruthy();
  });
});
