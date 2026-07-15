import { render, screen } from '@testing-library/react-native';
import ChangePassword from './index';

// Smoke: change-password form screen.
describe('ChangePassword screen', () => {
  it('mounts and shows the header', async () => {
    await render(<ChangePassword />);
    expect(screen.getByText('Ubah Kata Sandi')).toBeTruthy();
  });
});
