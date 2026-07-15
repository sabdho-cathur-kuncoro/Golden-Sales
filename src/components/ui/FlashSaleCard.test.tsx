import { render, screen } from '@testing-library/react-native';
import FlashSaleCard, {
  FlashSaleCardEmpty,
  FlashSaleCardSkeleton,
} from './FlashSaleCard';

const data = {
  id: 1,
  image: 'https://example.com/x.png',
  name: 'Promo Semen',
  category: 'Bahan Bangunan',
  discount_percentage: 20,
  normal_price: 60000,
  discount_price: 48000,
};

describe('FlashSaleCard', () => {
  it('renders name, category, discount and both prices', async () => {
    await render(<FlashSaleCard data={data} />);
    expect(screen.getByText('Promo Semen')).toBeTruthy();
    expect(screen.getByText('Bahan Bangunan')).toBeTruthy();
    expect(screen.getByText('-20%')).toBeTruthy();
    expect(screen.getByText('S&K Berlaku')).toBeTruthy();
    expect(screen.getByText(/60\.000/)).toBeTruthy();
    expect(screen.getByText(/48\.000/)).toBeTruthy();
  });

  it('renders the empty state', async () => {
    await render(<FlashSaleCardEmpty />);
    expect(screen.getByText('Belum ada flash sale')).toBeTruthy();
  });

  it('renders the skeleton without crashing', async () => {
    const { toJSON } = await render(<FlashSaleCardSkeleton />);
    expect(toJSON()).toBeTruthy();
  });
});
