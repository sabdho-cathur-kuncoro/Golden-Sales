import { render, screen, fireEvent, act } from '@testing-library/react-native';
import GlobalInputModal from './GlobalInputModal';
import { useInputModalStore } from '@/stores/input.store';

describe('GlobalInputModal', () => {
  beforeEach(() => {
    useInputModalStore.setState({ visible: false, options: {} });
  });

  it('renders the title and placeholder from the store', async () => {
    await render(<GlobalInputModal />);
    await act(async () => {
      useInputModalStore
        .getState()
        .showInput({ title: 'Alasan Tolak', placeholder: 'Tulis alasan' });
    });
    expect(screen.getByText('Alasan Tolak')).toBeTruthy();
    expect(screen.getByPlaceholderText('Tulis alasan')).toBeTruthy();
  });

  it('invokes onConfirm with the typed value when "Simpan" is pressed', async () => {
    const onConfirm = jest.fn();
    await render(<GlobalInputModal />);
    await act(async () => {
      useInputModalStore
        .getState()
        .showInput({ title: 'Catatan', placeholder: 'Isi', onConfirm });
    });

    // Confirm is gated on non-empty trimmed text — commit the input via act so
    // the button un-disables before we press it.
    await act(async () => {
      fireEvent.changeText(screen.getByPlaceholderText('Isi'), 'Stok kosong');
    });
    await act(async () => {
      fireEvent.press(screen.getByText('Simpan'));
    });
    expect(onConfirm).toHaveBeenCalledWith('Stok kosong');
  });

  it('does not fire onConfirm while the field is empty', async () => {
    const onConfirm = jest.fn();
    await render(<GlobalInputModal />);
    await act(async () => {
      useInputModalStore.getState().showInput({ title: 'Catatan', onConfirm });
    });
    await act(async () => {
      fireEvent.press(screen.getByText('Simpan'));
    });
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('hides when "Batal" is pressed', async () => {
    await render(<GlobalInputModal />);
    await act(async () => {
      useInputModalStore.getState().showInput({ title: 'Catatan' });
    });
    await act(async () => {
      fireEvent.press(screen.getByText('Batal'));
    });
    expect(useInputModalStore.getState().visible).toBe(false);
  });
});
