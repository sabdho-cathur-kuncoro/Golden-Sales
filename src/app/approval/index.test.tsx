// SMOKE: approval list route mounts + shows its header. useApprovalOrders
// (→ approval/orders services) is mocked to a loaded empty state.
jest.mock('@/hooks/useApprovalOrders', () => ({
  __esModule: true,
  default: () => ({
    STATUS_OPTIONS: [{ value: '', label: 'Semua' }],
    status: '',
    setStatus: jest.fn(),
    setSearch: jest.fn(),
    orders: [],
    totalRecords: 0,
    loading: false,
    loadingMore: false,
    refreshing: false,
    error: '',
    loadMore: jest.fn(),
    onRefresh: jest.fn(),
  }),
}));

import { render, screen } from '@testing-library/react-native';
import Approval from './index';

describe('Approval list screen (smoke)', () => {
  it('mounts and renders the header', async () => {
    await render(<Approval />);
    expect(await screen.findByText('Approval')).toBeTruthy();
  });
});
