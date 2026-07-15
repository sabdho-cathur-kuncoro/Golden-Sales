import { render, screen } from '@testing-library/react-native';
import Faq from './index';

// Smoke: FAQ screen with a static list.
describe('FAQ screen', () => {
  it('mounts and shows the hero heading', async () => {
    await render(<Faq />);
    expect(screen.getByText('Ada yang bisa kami bantu?')).toBeTruthy();
  });
});
