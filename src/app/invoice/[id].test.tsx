// Smoke: Invoice screen. It loads the order on mount; mock the service to resolve
// null so it settles into the not-found state (loading shows only a spinner).
jest.mock('@/services/orders.services', () => ({
  getDetailOrdersService: jest.fn(async () => null),
}));

import { render, screen } from '@testing-library/react-native';
import InvoiceScreen from './[id]';

describe('Invoice screen', () => {
  it('renders the not-found state when no order loads', async () => {
    await render(<InvoiceScreen />);
    expect(await screen.findByText('Invoice tidak ditemukan')).toBeTruthy();
  });
});
