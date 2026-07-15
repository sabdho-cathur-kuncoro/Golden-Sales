// Smoke: Payment (VA instructions) screen — no mount service.
import { render, screen } from '@testing-library/react-native';
import Payment from './index';

describe('Payment screen', () => {
  it('renders the payment header', async () => {
    await render(<Payment />);
    expect(screen.getByText('Pembayaran')).toBeTruthy();
  });
});
