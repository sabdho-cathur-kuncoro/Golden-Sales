// Smoke: Konfirmasi-order (order completion) screen — no mount service.
import { render, screen } from '@testing-library/react-native';
import KonfirmasiOrder from './index';

describe('Konfirmasi order screen', () => {
  it('renders the completion header', async () => {
    await render(<KonfirmasiOrder />);
    expect(screen.getByText('Penyelesaian Order')).toBeTruthy();
  });
});
