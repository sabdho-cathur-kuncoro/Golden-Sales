// SMOKE: customer list route mounts + shows its header. The data controller
// (useCustomers → sale.services) is mocked to safe empty/loaded state so the
// render is deterministic and network-free.
jest.mock('@/hooks/useCustomers', () => ({
  __esModule: true,
  default: () => ({
    STATUS_OPTIONS: [{ value: '', label: 'Semua' }],
    setSearch: jest.fn(),
    status: '',
    setStatus: jest.fn(),
    rows: [],
    pendingRegs: [],
    loading: false,
    refreshing: false,
    error: '',
    onRefresh: jest.fn(),
  }),
}));

import { render, screen } from '@testing-library/react-native';
import Customer from './index';

describe('Customer list screen (smoke)', () => {
  it('mounts and renders the header', async () => {
    await render(<Customer />);
    expect(await screen.findByText('Customer Saya')).toBeTruthy();
  });
});
