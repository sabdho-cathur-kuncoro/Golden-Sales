// Smoke: Order product-detail screen. With no warehouse set the controller
// redirects (router.replace is mocked) and never fetches, so productDetail stays
// null and the "not found" state renders — a stable anchor.
import { render, screen } from '@testing-library/react-native';
import { useCartStore } from '@/stores/cart.store';
import OrderProductDetail from './productDetail';

beforeEach(() => {
  useCartStore.setState({ items: [], warehouse: null, hydrated: true });
});

describe('Order product-detail screen', () => {
  it('renders the not-found state when no product is loaded', async () => {
    await render(<OrderProductDetail />);
    expect(screen.getByText('Produk tidak ditemukan')).toBeTruthy();
  });
});
