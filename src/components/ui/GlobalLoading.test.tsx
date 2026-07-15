import { render, screen, fireEvent, act } from '@testing-library/react-native';
import GlobalLoading from './GlobalLoading';
import { useLoadingStore } from '@/stores/loading.store';

const closedState = {
  visible: false,
  message: undefined,
  cancellable: false,
  onCancel: undefined,
  startedAt: null,
};

describe('GlobalLoading', () => {
  beforeEach(() => {
    useLoadingStore.setState(closedState);
  });

  it('renders nothing while hidden', async () => {
    await render(<GlobalLoading />);
    expect(screen.queryByText('Memuat...')).toBeNull();
  });

  it('shows the message when the store is visible', async () => {
    await render(<GlobalLoading />);
    await act(async () => {
      useLoadingStore.setState({ visible: true, message: 'Memuat...' });
    });
    expect(screen.getByText('Memuat...')).toBeTruthy();
  });

  it('invokes cancelLoading when the Cancel button is pressed', async () => {
    const cancelLoading = jest.fn();
    await render(<GlobalLoading />);
    await act(async () => {
      useLoadingStore.setState({
        visible: true,
        cancellable: true,
        cancelLoading,
      });
    });
    fireEvent.press(screen.getByText('Cancel'));
    expect(cancelLoading).toHaveBeenCalledTimes(1);
  });
});
