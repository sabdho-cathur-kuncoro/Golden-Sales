import { render, screen } from '@testing-library/react-native';
import ProfilDetail from './index';

// Smoke: profile detail screen (auth store user is null → "-" fields).
describe('ProfilDetail screen', () => {
  it('mounts and shows the header', async () => {
    await render(<ProfilDetail />);
    expect(screen.getByText('Profil Detail')).toBeTruthy();
  });
});
