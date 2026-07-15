import { render, screen, fireEvent } from '@testing-library/react-native';
import TileOrder from './TileOrder';

const baseItem = {
  id: 'ORD-100',
  customer_name: 'Toko Maju',
  customer_phone: '08123',
  created_at: '14 Jul 2026',
  status_order_name: 'Diproses Sales',
  status_order: 1,
  qty: 5,
  subtotal: 250000,
  payment_method: 'Tunai',
};

describe('TileOrder', () => {
  it('renders id, customer, status label and qty', async () => {
    await render(<TileOrder item={baseItem} onPress={() => {}} />);
    expect(screen.getByText('ORD-100')).toBeTruthy();
    expect(screen.getByText('Toko Maju')).toBeTruthy();
    expect(screen.getByText('Diproses Sales')).toBeTruthy();
    expect(screen.getByText('5 Item')).toBeTruthy();
  });

  it('shows payment method label by default', async () => {
    await render(<TileOrder item={baseItem} onPress={() => {}} />);
    expect(screen.getByText('Metode Pembayaran')).toBeTruthy();
    expect(screen.getByText('Tunai')).toBeTruthy();
  });

  it('shows subtotal instead of payment method in report mode', async () => {
    await render(<TileOrder item={baseItem} isReport onPress={() => {}} />);
    expect(screen.getByText('Subtotal')).toBeTruthy();
    expect(screen.getByText(/250\.000/)).toBeTruthy();
    expect(screen.queryByText('Metode Pembayaran')).toBeNull();
  });

  it('reflects a different status label (rejected)', async () => {
    await render(
      <TileOrder item={{ ...baseItem, status_order: 6, status_order_name: 'Ditolak' }} onPress={() => {}} />
    );
    expect(screen.getByText('Ditolak')).toBeTruthy();
  });

  it('fires onPress when the tile is tapped', async () => {
    const onPress = jest.fn();
    await render(<TileOrder item={baseItem} onPress={onPress} />);
    fireEvent.press(screen.getByText('ORD-100'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders the complete button and fires onComplete', async () => {
    const onComplete = jest.fn();
    await render(<TileOrder item={baseItem} onPress={() => {}} showComplete onComplete={onComplete} />);
    const btn = screen.getByText('Selesai — Masukkan ke Stock');
    fireEvent.press(btn);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('shows a loading label on the complete button while completing', async () => {
    await render(
      <TileOrder item={baseItem} onPress={() => {}} showComplete completeLoading onComplete={() => {}} />
    );
    expect(screen.getByText('Memproses...')).toBeTruthy();
  });
});
