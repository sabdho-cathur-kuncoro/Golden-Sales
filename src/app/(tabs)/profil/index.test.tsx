import { render, screen } from '@testing-library/react-native';
import Profile from './index';

// Smoke: profile menu screen (auth store user is null → renders "-" fields).
describe('Profil screen', () => {
  it('mounts and shows a menu item', async () => {
    await render(<Profile />);
    expect(screen.getByText('FAQ')).toBeTruthy();
  });
});
