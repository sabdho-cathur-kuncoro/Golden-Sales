import { render, screen } from '@testing-library/react-native';
import Report from './index';

// Smoke: static report menu screen.
describe('Laporan screen', () => {
  it('mounts and shows the header', async () => {
    await render(<Report />);
    expect(screen.getByText('Laporan')).toBeTruthy();
  });
});
