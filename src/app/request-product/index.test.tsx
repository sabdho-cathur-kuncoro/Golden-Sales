import { render, screen } from '@testing-library/react-native';

// Mount-time controllers fire axios — stub to safe/empty.
jest.mock('@/hooks/useProductListController', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    user: null,
    filtered: [],
    loading: false,
    search: '',
    setSearch: jest.fn(),
    refreshing: false,
    onRefresh: jest.fn(),
  })),
}));
jest.mock('@/hooks/useWarehouse', () => ({
  __esModule: true,
  default: jest.fn(() => ({ warehouse: null, warehouses: [], loading: false })),
}));

import Request from './index';

describe('Request (Permintaan Barang) screen (smoke)', () => {
  it('mounts and shows the header', async () => {
    await render(<Request />);
    expect(screen.getByText('Permintaan Barang')).toBeTruthy();
  });
});
