import { render, screen } from '@testing-library/react-native';
import FlashSaleCard, {
  FlashSaleCardEmpty,
  FlashSaleCardSkeleton,
} from './FlashSaleCard';
import { currencyFormat } from '../../../utils/currencyFormat';

const props = {
  discount: '20',
  productName: 'Promo Semen',
  category: 'Bahan Bangunan',
  normalPrice: currencyFormat(60000),
  discountPrice: currencyFormat(48000),
  onPress: () => {},
};

describe('FlashSaleCard', () => {
  it('renders name, category and both prices', async () => {
    await render(<FlashSaleCard {...props} />);
    expect(screen.getByText('Promo Semen')).toBeTruthy();
    expect(screen.getByText('Bahan Bangunan')).toBeTruthy();
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
