// Smoke: Payment-method list screen — dummy-data driven, no mount service.
import { render, screen } from '@testing-library/react-native';
import PaymentMethod from './index';

describe('Payment-method screen', () => {
  it('renders the payment-method header', async () => {
    await render(<PaymentMethod />);
    expect(screen.getByText('Metode Pembayaran')).toBeTruthy();
  });
});
