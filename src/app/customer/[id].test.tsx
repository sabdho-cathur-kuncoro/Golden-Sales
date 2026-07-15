// SMOKE: customer detail route mounts + shows its header. Local expo-router
// mock supplies the [id] param; useCustomerDetail is mocked to a loaded record.
jest.mock('expo-router', () => ({
  __esModule: true,
  router: { push: jest.fn(), back: jest.fn(), replace: jest.fn() },
  useRouter: () => ({ push: jest.fn(), back: jest.fn(), replace: jest.fn() }),
  useLocalSearchParams: () => ({ id: '42' }),
  useIsFocused: () => true,
}));
jest.mock('@/hooks/useCustomerDetail', () => ({
  __esModule: true,
  default: () => ({
    data: { customerName: 'Toko Maju', customerCode: 'CUST001', status: 'Active', pending: null },
    loading: false,
    submitting: false,
    error: '',
    submitStatusRequest: jest.fn(),
  }),
}));

import { render, screen } from '@testing-library/react-native';
import CustomerDetail from './[id]';

describe('Customer detail screen (smoke)', () => {
  it('mounts and renders the header', async () => {
    await render(<CustomerDetail />);
    expect(await screen.findByText('Detail Customer')).toBeTruthy();
  });
});
