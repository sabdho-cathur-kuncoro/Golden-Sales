// SMOKE: create-customer route mounts + shows its header. useCreateCustomer is
// mocked to an empty form so the network-free form renders deterministically.
jest.mock('@/hooks/useCreateCustomer', () => ({
  __esModule: true,
  default: () => ({
    form: {
      customerCode: '',
      customerName: '',
      contactPerson: '',
      phone: '',
      email: '',
      address1: '',
      city: '',
      regency: '',
      warehouseId: '',
    },
    setField: jest.fn(),
    warehouses: [],
    whLoading: false,
    codeStatus: 'idle',
    codeMessage: '',
    onCodeChange: jest.fn(),
    phoneStatus: 'idle',
    phoneMessage: '',
    onPhoneChange: jest.fn(),
    submitting: false,
    error: '',
    submit: jest.fn(),
    canSubmit: false,
  }),
}));

import { render, screen } from '@testing-library/react-native';
import CreateCustomer from './new';

describe('Create customer screen (smoke)', () => {
  it('mounts and renders the header', async () => {
    await render(<CreateCustomer />);
    expect(await screen.findByText('Tambah Customer')).toBeTruthy();
  });
});
