import { render, screen, fireEvent, act } from '@testing-library/react-native';
import FilterSheet from './FilterSheet';

const emptyFilter = { payment: null, start: null, end: null };

// BottomSheetScrollView is globally mocked to a passthrough.
describe('FilterSheet', () => {
  it('renders the payment options and date range section', async () => {
    await render(
      <FilterSheet
        current={emptyFilter}
        onApply={jest.fn()}
        onReset={jest.fn()}
      />
    );
    expect(screen.getByText('Metode Pembayaran')).toBeTruthy();
    expect(screen.getByText('Semua Metode')).toBeTruthy();
    expect(screen.getByText('Transfer Bank')).toBeTruthy();
    expect(screen.getByText('COD')).toBeTruthy();
    expect(screen.getByText('Tunai')).toBeTruthy();
    expect(screen.getByText('Rentang Tanggal')).toBeTruthy();
  });

  it('applies the selected payment method via "Terapkan"', async () => {
    const onApply = jest.fn();
    await render(
      <FilterSheet
        current={emptyFilter}
        onApply={onApply}
        onReset={jest.fn()}
      />
    );
    // Wrap in act so the selection state commits before we read it via Terapkan.
    await act(async () => {
      fireEvent.press(screen.getByText('COD'));
    });
    await act(async () => {
      fireEvent.press(screen.getByText('Terapkan'));
    });
    expect(onApply).toHaveBeenCalledWith({
      payment: 'COD',
      start: null,
      end: null,
    });
  });

  it('calls onReset when "Reset" is pressed', async () => {
    const onReset = jest.fn();
    await render(
      <FilterSheet
        current={emptyFilter}
        onApply={jest.fn()}
        onReset={onReset}
      />
    );
    await act(async () => {
      fireEvent.press(screen.getByText('Reset'));
    });
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it('honours a custom paymentOptions list', async () => {
    await render(
      <FilterSheet
        current={emptyFilter}
        onApply={jest.fn()}
        onReset={jest.fn()}
        paymentOptions={[{ label: 'QRIS', value: 'QRIS' }]}
      />
    );
    expect(screen.getByText('QRIS')).toBeTruthy();
    expect(screen.queryByText('COD')).toBeNull();
  });
});
