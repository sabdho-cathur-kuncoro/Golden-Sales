import { render, screen } from '@testing-library/react-native';

// Mount-time controllers fire axios on mount — stub them to safe/empty so the
// smoke render is deterministic and network-free.
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

import Catalog from './index';

describe('Catalog screen (smoke)', () => {
  it('mounts and shows the header', async () => {
    await render(<Catalog />);
    expect(screen.getByText('Katalog')).toBeTruthy();
  });
});
