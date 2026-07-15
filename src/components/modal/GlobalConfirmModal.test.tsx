import { render, screen, fireEvent, act } from '@testing-library/react-native';
import GlobalConfirmModal from './GlobalConfirmModal';
import { useConfirmStore } from '@/stores/confirm.store';

describe('GlobalConfirmModal', () => {
  beforeEach(() => {
    useConfirmStore.setState({ visible: false, options: {} });
  });

  it('shows default copy when opened without title/message', async () => {
    await render(<GlobalConfirmModal />);
    await act(async () => {
      useConfirmStore.getState().show({});
    });
    expect(screen.getByText('Konfirmasi')).toBeTruthy();
    expect(screen.getByText('Apakah kamu yakin?')).toBeTruthy();
  });

  it('renders the provided title and message', async () => {
    await render(<GlobalConfirmModal />);
    await act(async () => {
      useConfirmStore
        .getState()
        .show({ title: 'Hapus Data', message: 'Yakin hapus?' });
    });
    expect(screen.getByText('Hapus Data')).toBeTruthy();
    expect(screen.getByText('Yakin hapus?')).toBeTruthy();
  });

  it('invokes onConfirm when "Ya" is pressed', async () => {
    const onConfirm = jest.fn();
    await render(<GlobalConfirmModal />);
    await act(async () => {
      useConfirmStore.getState().show({ title: 'Hapus', onConfirm });
    });
    await act(async () => {
      fireEvent.press(screen.getByText('Ya'));
    });
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('hides (dismisses) when "Batal" is pressed', async () => {
    await render(<GlobalConfirmModal />);
    await act(async () => {
      useConfirmStore.getState().show({ title: 'Hapus' });
    });
    await act(async () => {
      fireEvent.press(screen.getByText('Batal'));
    });
    expect(useConfirmStore.getState().visible).toBe(false);
  });
});
