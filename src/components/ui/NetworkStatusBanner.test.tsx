import { render, screen, act } from '@testing-library/react-native';
import NetworkStatusBanner from './NetworkStatusBanner';
import { useNetworkStore, resetLatencySamples } from '@/stores/network.store';

// Drives the Zustand-singleton pattern end-to-end: mutate the store, assert the
// banner reflects the derived view-state (offline > unstable > hidden).
describe('NetworkStatusBanner', () => {
  beforeEach(() => {
    resetLatencySamples();
    useNetworkStore.setState({ isConnected: true, isSlow: false });
  });

  it('is hidden on a healthy connection', async () => {
    await render(<NetworkStatusBanner />);
    expect(screen.queryByText('Tidak ada koneksi internet')).toBeNull();
    expect(screen.queryByText('Koneksi tidak stabil')).toBeNull();
  });

  it('shows the offline banner when disconnected', async () => {
    await render(<NetworkStatusBanner />);
    await act(async () => {
      useNetworkStore.setState({ isConnected: false });
    });
    expect(screen.getByText('Tidak ada koneksi internet')).toBeTruthy();
  });

  it('shows the unstable banner when connected but slow', async () => {
    await render(<NetworkStatusBanner />);
    await act(async () => {
      useNetworkStore.setState({ isConnected: true, isSlow: true });
    });
    expect(screen.getByText('Koneksi tidak stabil')).toBeTruthy();
  });
});
