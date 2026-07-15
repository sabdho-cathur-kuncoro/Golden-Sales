import { render, screen } from '@testing-library/react-native';
import Login from './login';

// Smoke: renders the login screen and shows its heading.
describe('Login screen', () => {
  it('mounts and shows the heading', async () => {
    await render(<Login />);
    expect(screen.getByText('Masuk ke Akun Anda')).toBeTruthy();
  });
});
