import { render, screen } from '@testing-library/react-native';
import ForgotPasswordSuccess from './success';

// Smoke: static success screen.
describe('ForgotPassword success screen', () => {
  it('mounts and shows the success message', async () => {
    await render(<ForgotPasswordSuccess />);
    expect(screen.getByText('Password Berhasil Direset')).toBeTruthy();
  });
});
