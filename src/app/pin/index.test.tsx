import { render, screen } from '@testing-library/react-native';
import PinScreen from './index';

// Smoke: PIN create/confirm screen (starts in "create" phase).
describe('PIN screen', () => {
  it('mounts and shows the create-phase title', async () => {
    await render(<PinScreen />);
    expect(screen.getByText('Buat PIN')).toBeTruthy();
  });
});
