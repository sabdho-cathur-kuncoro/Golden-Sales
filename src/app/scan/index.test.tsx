// SMOKE: scan/penjualan route mounts + shows its header. The scan controller
// (camera + sale.services) is mocked to a safe idle state so no camera device
// or network is exercised.
jest.mock('@/hooks/useScanController', () => ({
  __esModule: true,
  default: () => ({
    cart: [],
    manualQr: '',
    setManualQr: jest.fn(),
    statusMsg: '',
    statusColor: '#000',
    busy: false,
    camOn: false,
    setCamOn: jest.fn(),
    buyerName: '',
    setBuyerName: jest.fn(),
    buyerPhone: '',
    setBuyerPhone: jest.fn(),
    submitting: false,
    stock: { totalQty: 0, groups: [] },
    stockLoading: false,
    stockErr: '',
    expanded: {},
    toggleGroup: jest.fn(),
    device: null,
    codeScanner: {},
    fps: 30,
    format: {},
    isFocused: true,
    tryAdd: jest.fn(),
    removeItem: jest.fn(),
    updatePrice: jest.fn(),
    cartTotal: 0,
    submit: jest.fn(),
  }),
}));

import { render, screen } from '@testing-library/react-native';
import Scan from './index';

describe('Scan (penjualan) screen (smoke)', () => {
  it('mounts and renders the header', async () => {
    await render(<Scan />);
    expect(await screen.findByText('Penjualan')).toBeTruthy();
  });
});
