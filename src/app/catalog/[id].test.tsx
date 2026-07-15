import { render, screen } from '@testing-library/react-native';

// [id] screen: provide an id via a local expo-router override.
jest.mock('expo-router', () => ({
  __esModule: true,
  router: { push: jest.fn(), back: jest.fn(), replace: jest.fn() },
  useLocalSearchParams: () => ({ id: 'PRD-1' }),
}));

// Detail controller hits the network on mount — stub to the loading state.
jest.mock('@/hooks/useKatalogDetailController', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    productDetail: null,
    detailLoading: true,
    imgList: [],
    imgView: null,
    stockList: [],
    setImagetoView: jest.fn(),
    refreshing: false,
    onRefresh: jest.fn(),
    isKartuPerdana: false,
    promos: [],
    activePromo: null,
  })),
}));

import CatalogDetail from './[id]';

describe('CatalogDetail screen (smoke)', () => {
  it('mounts and shows the detail header', async () => {
    await render(<CatalogDetail />);
    expect(screen.getByText('Detail Produk')).toBeTruthy();
  });
});
