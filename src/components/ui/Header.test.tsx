import { render, screen } from '@testing-library/react-native';

// Harness gap: `@/assets/*.svg` bypasses the global svgMock (the `^@/assets/`
// moduleNameMapper rule matches before `\.svg$`). Stub the cart icon locally.
jest.mock('@/assets/icons/ic-cart.svg', () => {
  const React = require('react');
  return { __esModule: true, default: (p: any) => React.createElement('Svg', p) };
});

import Header from './Header';
import { useCartStore } from '@/stores/cart.store';
import { useNotificationStore } from '@/stores/notification.store';

// Header derives its two badges from Zustand singletons — drive them directly.
describe('Header', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] });
    useNotificationStore.setState({ unread: 0 });
  });

  it('renders the title', async () => {
    await render(<Header title="Keranjang" />);
    expect(screen.getByText('Keranjang')).toBeTruthy();
  });

  it('shows the cart badge count when the cart has items and the icon is visible', async () => {
    useCartStore.setState({ items: [{ quantity: 3 }] });
    await render(<Header title="Katalog" isIconVisible />);
    expect(screen.getByText('3')).toBeTruthy();
  });

  it('shows the notification badge when there are unread notifications', async () => {
    useNotificationStore.setState({ unread: 7 });
    await render(<Header title="Beranda" isNotifVisible />);
    expect(screen.getByText('7')).toBeTruthy();
  });

  it('caps large counts at 99+', async () => {
    useNotificationStore.setState({ unread: 150 });
    await render(<Header title="Beranda" isNotifVisible />);
    expect(screen.getByText('99+')).toBeTruthy();
  });

  it('hides the notification badge when there are no unread notifications', async () => {
    await render(<Header title="Beranda" isNotifVisible />);
    expect(screen.queryByText('0')).toBeNull();
  });
});
