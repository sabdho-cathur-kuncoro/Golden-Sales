import { render, screen } from '@testing-library/react-native';

// Orders controller fires axios on mount — stub to empty. Keep the named
// REQUEST_STATUS_OPTIONS export the screen imports alongside the default.
jest.mock('@/hooks/useMyOrders', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    STATUS_OPTIONS: [],
    status: '',
    setStatus: jest.fn(),
    setSearch: jest.fn(),
    from: null,
    to: null,
    setDateRange: jest.fn(),
    orders: [],
    totalRecords: 0,
    loading: false,
    loadingMore: false,
    refreshing: false,
    error: null,
    loadMore: jest.fn(),
    onRefresh: jest.fn(),
  })),
  REQUEST_STATUS_OPTIONS: [],
}));

import Permintaan from './permintaan';

describe('Permintaan screen (smoke)', () => {
  it('mounts and shows the header', async () => {
    await render(<Permintaan />);
    expect(screen.getByText('Permintaan Saya')).toBeTruthy();
  });
});
