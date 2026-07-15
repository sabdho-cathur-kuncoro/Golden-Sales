import { render, screen } from '@testing-library/react-native';

// History controller fires axios on mount — stub to empty.
jest.mock('@/hooks/useReturnHistory', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    search: '',
    setSearch: jest.fn(),
    from: null,
    to: null,
    setDateRange: jest.fn(),
    isFilterActive: false,
    returns: [],
    summary: { itemCount: 0, totalNominal: 0 },
    totalRecords: 0,
    loading: false,
    loadingMore: false,
    refreshing: false,
    error: null,
    loadMore: jest.fn(),
    onRefresh: jest.fn(),
    expanded: null,
    detailCache: {},
    detailLoading: false,
    toggleExpand: jest.fn(),
  })),
}));

import ReturnScreen from './index';

describe('Return (Pengembalian) screen (smoke)', () => {
  it('mounts and shows the header', async () => {
    await render(<ReturnScreen />);
    expect(screen.getByText('Pengembalian Saya')).toBeTruthy();
  });
});
