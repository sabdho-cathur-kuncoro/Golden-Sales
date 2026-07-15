// Smoke: Checkout screen mounts with an empty cart. The voucher-validate effect
// only fires for a non-empty code, so nothing hits the network on mount.
import { render, screen } from '@testing-library/react-native';
import { useCartStore } from '@/stores/cart.store';
import Checkout from './index';

beforeEach(() => {
  useCartStore.setState({ items: [], warehouse: null, hydrated: true });
});

describe('Checkout screen', () => {
  it('renders the order-detail header', async () => {
    await render(<Checkout />);
    expect(screen.getByText('Rincian Pesanan')).toBeTruthy();
    expect(screen.getByText('Keranjang kosong')).toBeTruthy();
  });
});
