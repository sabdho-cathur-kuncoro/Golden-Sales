import { render, screen } from '@testing-library/react-native';
import UpdateScreen from './index';

describe('Update screen (smoke)', () => {
  it('mounts and shows the update prompt', async () => {
    await render(<UpdateScreen />);
    expect(screen.getByText('Perbarui Aplikasi')).toBeTruthy();
  });
});
