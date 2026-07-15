import { render, screen, fireEvent, act } from '@testing-library/react-native';
import GlobalPrePermissionModal from './GlobalPrePermissionModal';
import { usePrePermissionModal } from '@/stores/prePermission.store';

const showOpts = (over: Partial<any> = {}) => ({
  title: 'Izinkan Kamera',
  description: 'Kami butuh kamera untuk memindai barcode.',
  onConfirm: jest.fn(),
  onCancel: jest.fn(),
  ...over,
});

describe('GlobalPrePermissionModal', () => {
  beforeEach(() => {
    usePrePermissionModal.setState({ visible: false, options: undefined });
  });

  it('renders the title and description from the store', async () => {
    await render(<GlobalPrePermissionModal />);
    await act(async () => {
      usePrePermissionModal.getState().show(showOpts());
    });
    expect(screen.getByText('Izinkan Kamera')).toBeTruthy();
    expect(
      screen.getByText('Kami butuh kamera untuk memindai barcode.')
    ).toBeTruthy();
  });

  it('uses custom confirm/cancel labels when supplied', async () => {
    await render(<GlobalPrePermissionModal />);
    await act(async () => {
      usePrePermissionModal
        .getState()
        .show(showOpts({ confirmText: 'Lanjut', cancelText: 'Nanti' }));
    });
    expect(screen.getByText('Lanjut')).toBeTruthy();
    expect(screen.getByText('Nanti')).toBeTruthy();
  });

  it('invokes onConfirm when the confirm button is pressed', async () => {
    const onConfirm = jest.fn();
    await render(<GlobalPrePermissionModal />);
    await act(async () => {
      usePrePermissionModal.getState().show(showOpts({ onConfirm }));
    });
    await act(async () => {
      fireEvent.press(screen.getByText('Izinkan'));
    });
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('invokes onCancel and hides when the cancel button is pressed', async () => {
    const onCancel = jest.fn();
    await render(<GlobalPrePermissionModal />);
    await act(async () => {
      usePrePermissionModal.getState().show(showOpts({ onCancel }));
    });
    await act(async () => {
      fireEvent.press(screen.getByText('Batal'));
    });
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(usePrePermissionModal.getState().visible).toBe(false);
  });
});
