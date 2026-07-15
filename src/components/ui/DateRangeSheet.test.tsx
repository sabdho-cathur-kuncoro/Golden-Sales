import { render, screen, fireEvent, act } from '@testing-library/react-native';
import DateRangeSheet from './DateRangeSheet';

const emptyRange = { start: null, end: null };

// BottomSheetScrollView is globally mocked to a passthrough.
describe('DateRangeSheet', () => {
  it('renders the section, date fields and actions', async () => {
    await render(
      <DateRangeSheet
        current={emptyRange}
        onApply={jest.fn()}
        onReset={jest.fn()}
      />
    );
    expect(screen.getByText('Rentang Tanggal')).toBeTruthy();
    expect(screen.getByText('Tanggal Mulai')).toBeTruthy();
    expect(screen.getByText('Tanggal Akhir')).toBeTruthy();
    // Both fields start unfilled.
    expect(screen.getAllByText('Pilih tanggal').length).toBe(2);
    expect(screen.getByText('Reset')).toBeTruthy();
    expect(screen.getByText('Terapkan')).toBeTruthy();
  });

  it('calls onApply with the current range when "Terapkan" is pressed', async () => {
    const onApply = jest.fn();
    await render(
      <DateRangeSheet
        current={emptyRange}
        onApply={onApply}
        onReset={jest.fn()}
      />
    );
    await act(async () => {
      fireEvent.press(screen.getByText('Terapkan'));
    });
    expect(onApply).toHaveBeenCalledWith({ start: null, end: null });
  });

  it('calls onReset when "Reset" is pressed', async () => {
    const onReset = jest.fn();
    await render(
      <DateRangeSheet
        current={emptyRange}
        onApply={jest.fn()}
        onReset={onReset}
      />
    );
    await act(async () => {
      fireEvent.press(screen.getByText('Reset'));
    });
    expect(onReset).toHaveBeenCalledTimes(1);
  });
});
