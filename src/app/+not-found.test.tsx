import { render, screen } from '@testing-library/react-native';
import NotFound from './+not-found';

// Smoke: 404 screen.
describe('NotFound screen', () => {
  it('mounts and shows the not-found message', async () => {
    await render(<NotFound />);
    expect(screen.getByText('Halaman tidak ditemukan')).toBeTruthy();
  });
});
