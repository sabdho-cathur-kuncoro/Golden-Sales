import { render, screen } from '@testing-library/react-native';
import ForgotPasswordVerify from './index';

// Smoke: renders the forgot-password verify screen.
describe('ForgotPassword verify screen', () => {
  it('mounts and shows the header', async () => {
    await render(<ForgotPasswordVerify />);
    expect(screen.getByText('Lupa Password')).toBeTruthy();
  });
});
