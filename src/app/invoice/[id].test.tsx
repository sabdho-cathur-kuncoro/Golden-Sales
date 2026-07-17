// Smoke: Invoice screen. It loads the order on mount; mock the service to resolve
// null so it settles into the not-found state (loading shows only a spinner).
jest.mock('@/services/orders.services', () => ({
  getDetailOrdersService: jest.fn(async () => null),
}));

import { render, screen } from '@testing-library/react-native';
import { getDetailOrdersService } from '@/services/orders.services';
import InvoiceScreen from './[id]';

const getDetail = getDetailOrdersService as jest.Mock;

beforeEach(() => jest.clearAllMocks());

// Taxed order with a promo single item + a promo SN group (2 rows same
// productName+unitPrice → isGrouped).
const taxedPromoOrder = {
  id: 1,
  orderNumber: 'ORD-001',
  status: 'Diproses',
  createdAt: '2026-07-01T10:00:00Z',
  customer: { customerName: 'Toko Abadi' },
  items: [
    {
      id: 1,
      productName: 'Semen',
      unitPrice: 60000,
      quantity: 2,
      discount: 10000,
      subtotal: 110000,
    },
    {
      id: 2,
      productName: 'Kartu Perdana',
      unitPrice: 25000,
      quantity: 1,
      discount: 2500,
      productCode: 'SN-1',
      subtotal: 22500,
    },
    {
      id: 3,
      productName: 'Kartu Perdana',
      unitPrice: 25000,
      quantity: 1,
      discount: 2500,
      productCode: 'SN-2',
      subtotal: 22500,
    },
  ],
  orderTax: 11,
  orderTaxAmount: 17050,
  deliveryFee: 0,
  adminFee: 0,
  total: 172050,
};

describe('Invoice screen', () => {
  it('renders the not-found state when no order loads', async () => {
    await render(<InvoiceScreen />);
    expect(await screen.findByText('Invoice tidak ditemukan')).toBeTruthy();
  });

  it('renders the voucher discount row when discountVoucher > 0', async () => {
    getDetail.mockResolvedValueOnce({ ...taxedPromoOrder, discountVoucher: 5000 });
    await render(<InvoiceScreen />);
    expect(await screen.findByText('Diskon Voucher')).toBeTruthy();
  });

  it('shows per-item promo: net unit price and Hemat pills', async () => {
    getDetail.mockResolvedValueOnce(taxedPromoOrder);
    await render(<InvoiceScreen />);
    await screen.findByText('Semen');
    // single row: net unit 60000 - 10000/2 = 55000 next to struck-through 60000
    expect(screen.getByText(/55\.000/)).toBeTruthy();
    // one Hemat pill on the single row + one on the grouped row
    expect(screen.getAllByText(/Hemat/).length).toBe(2);
  });
});
