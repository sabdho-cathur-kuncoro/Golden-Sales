import { render, screen } from '@testing-library/react-native';
import Report from './index';

describe('Report (Laporan) screen (smoke)', () => {
  it('mounts and shows the header', async () => {
    await render(<Report />);
    expect(screen.getByText('Laporan')).toBeTruthy();
  });
});
