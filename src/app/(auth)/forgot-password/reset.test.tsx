import { render, screen } from '@testing-library/react-native';
import ForgotPasswordReset from './reset';

// Smoke: reads route params via the global expo-router mock (returns {}).
describe('ForgotPassword reset screen', () => {
  it('mounts and shows the header', async () => {
    await render(<ForgotPasswordReset />);
    expect(screen.getByText('Atur Ulang Password')).toBeTruthy();
  });
});
