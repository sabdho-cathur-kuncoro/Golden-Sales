// Smoke: Rincian (order review) screen — dummy-data driven, no mount service.
import { render, screen } from '@testing-library/react-native';
import RincianOrder from './rincian';

describe('Rincian order screen', () => {
  it('renders the review header', async () => {
    await render(<RincianOrder />);
    expect(screen.getByText('Rincian Pesanan')).toBeTruthy();
    expect(screen.getByText('Produk Order')).toBeTruthy();
  });
});
