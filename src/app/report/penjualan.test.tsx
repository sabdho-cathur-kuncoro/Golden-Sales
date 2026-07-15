import { render, screen } from '@testing-library/react-native';

// History controller fires axios on mount — stub to empty.
jest.mock('@/hooks/useSalesHistory', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    search: '',
    setSearch: jest.fn(),
    from: null,
    to: null,
    setDateRange: jest.fn(),
    isFilterActive: false,
    sales: [],
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

import Penjualan from './penjualan';

describe('Penjualan screen (smoke)', () => {
  it('mounts and shows the header', async () => {
    await render(<Penjualan />);
    expect(screen.getByText('Penjualan Saya')).toBeTruthy();
  });
});
