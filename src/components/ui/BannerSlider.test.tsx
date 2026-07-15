import { render, screen } from '@testing-library/react-native';
import BannerSlider from './BannerSlider';

const banners = [
  { id: '1', image: 'aaa' },
  { id: '2', image: 'bbb' },
];

describe('BannerSlider', () => {
  it('renders the empty state when there is no data', async () => {
    await render(<BannerSlider data={[]} />);
    expect(screen.getByText('Belum ada banner')).toBeTruthy();
    expect(
      screen.getByText('Informasi terbaru akan segera hadir di sini.')
    ).toBeTruthy();
  });

  it('renders the skeleton (not the empty state) while loading', async () => {
    await render(<BannerSlider data={[]} loading />);
    expect(screen.queryByText('Belum ada banner')).toBeNull();
  });

  it('renders the slider (no empty state) when data is provided', async () => {
    await render(<BannerSlider data={banners} autoPlay={false} />);
    expect(screen.queryByText('Belum ada banner')).toBeNull();
  });
});
