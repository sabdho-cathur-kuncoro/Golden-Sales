import { render, screen } from '@testing-library/react-native';
import NetworkLogs from './index';

describe('NetworkLogs screen (smoke)', () => {
  it('mounts and shows the header', async () => {
    await render(<NetworkLogs />);
    expect(screen.getByText('Network Logs')).toBeTruthy();
  });
});
