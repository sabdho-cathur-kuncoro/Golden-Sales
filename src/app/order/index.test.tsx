// Smoke: Order (product list) screen. useWarehouse fetches /warehouses on mount
// and useProductListController only fetches once a warehouse is set — mock the
// warehouse service so nothing dangling hits the network.
jest.mock('@/services/global.services', () => ({
  getWarehousesService: jest.fn(async () => []),
}));

import { render, screen } from '@testing-library/react-native';
import { useCartStore } from '@/stores/cart.store';
import Order from './index';

beforeEach(() => {
  useCartStore.setState({ items: [], warehouse: null, hydrated: true });
});

describe('Order screen', () => {
  it('renders the order header', async () => {
    await render(<Order />);
    expect(screen.getByText('Order Barang')).toBeTruthy();
    expect(screen.getByText('Daftar Produk')).toBeTruthy();
  });
});
