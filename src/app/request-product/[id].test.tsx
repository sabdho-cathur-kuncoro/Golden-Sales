import { render, screen } from '@testing-library/react-native';

// [id] screen: provide params via a local expo-router override.
jest.mock('expo-router', () => ({
  __esModule: true,
  router: { push: jest.fn(), back: jest.fn(), replace: jest.fn() },
  useLocalSearchParams: () => ({ id: 'REQ-1', name: 'Produk A', category: 'Kartu' }),
}));

import RequestProductDetail from './[id]';

describe('RequestProductDetail screen (smoke)', () => {
  it('mounts and shows the product picker section', async () => {
    await render(<RequestProductDetail />);
    expect(screen.getByText('Pilih Produk')).toBeTruthy();
  });
});
