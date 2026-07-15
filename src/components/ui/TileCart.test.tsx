import { render, screen, fireEvent } from '@testing-library/react-native';
import TileCart from './TileCart';

describe('TileCart', () => {
  it('shows a serial count and expands the serial sub-list on tap', async () => {
    await render(
      <TileCart item={{ productName: 'Router', salesPrice: 100000, serials: ['SN-1', 'SN-2'] }} />
    );
    expect(screen.getByText('2 nomor')).toBeTruthy();
    // collapsed by default
    expect(screen.queryByText('SN-1')).toBeNull();
    fireEvent.press(screen.getByText('2 nomor'));
    expect(await screen.findByText('Pilih semua nomor')).toBeTruthy();
    expect(screen.getByText('SN-1')).toBeTruthy();
    expect(screen.getByText('SN-2')).toBeTruthy();
  });

  it('shows a struck-through original price when a promo applies', async () => {
    await render(
      <TileCart
        item={{
          productName: 'Diskon',
          salesPrice: 10000,
          quantity: 1,
          promos: [{ discountType: 'cash', discountValue: 2000, minQuantity: 1 }],
        }}
      />
    );
    // discounted unit shown as primary price (10.000 - 2.000)
    expect(screen.getByText(/8\.000/)).toBeTruthy();
    // original price still shown (struck through)
    expect(screen.getByText(/10\.000/)).toBeTruthy();
  });

  it('renders a non-serial line: name, stock, price and qty', async () => {
    await render(
      <TileCart item={{ productName: 'Indomie', salesPrice: 5000, quantity: 3, stock: 10 }} />
    );
    expect(screen.getByText('Indomie')).toBeTruthy();
    expect(screen.getByText('Stok: 10')).toBeTruthy();
    expect(screen.getByText(/5\.000/)).toBeTruthy();
    // qty field mirrors the item quantity
    expect(screen.getByDisplayValue('3')).toBeTruthy();
  });

  // Kept as one press per test: two fireEvent.press after an awaited render let
  // the TextInput's React-19 mount passive-effect (a trailing Immediate) fire
  // between the two press acts → "overlapping act". One press per render avoids
  // the interleave.
  it('steps quantity up via the + button', async () => {
    const onInc = jest.fn();
    await render(
      <TileCart item={{ productName: 'Indomie', salesPrice: 5000, quantity: 2 }} onInc={onInc} />
    );
    fireEvent.press(screen.getByText('+'));
    expect(onInc).toHaveBeenCalledTimes(1);
  });

  it('steps quantity down via the - button', async () => {
    const onDec = jest.fn();
    await render(
      <TileCart item={{ productName: 'Indomie', salesPrice: 5000, quantity: 2 }} onDec={onDec} />
    );
    fireEvent.press(screen.getByText('-'));
    expect(onDec).toHaveBeenCalledTimes(1);
  });
});
