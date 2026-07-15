// Local mocks: the home screen fires data fetches on mount. Stub them to resolve
// empty so the smoke render is deterministic (no network, no async noise).
jest.mock('@/services/global.services', () => ({
  __esModule: true,
  getSlidersService: jest.fn(async () => []),
}));
jest.mock('@/services/orders.services', () => ({
  __esModule: true,
  getMyOrdersService: jest.fn(async () => ({ data: [] })),
}));
// The notification-permission hook hits react-native-permissions' checkNotifications
// (absent from the global mock). Stub it to a no-op grant for the smoke render.
jest.mock('@/hooks/useNotificationAccess', () => ({
  __esModule: true,
  useNotificationAccess: () => ({ request: jest.fn(async () => true) }),
}));

import { render, screen } from '@testing-library/react-native';
import { useCartStore } from '@/stores/cart.store';
import Home from './index';

describe('Home screen', () => {
  beforeEach(() => {
    // Skip cart hydration (would hit SQLite) — mark already hydrated.
    useCartStore.setState({ hydrated: true, items: [] });
  });

  it('mounts and shows the welcome label', async () => {
    await render(<Home />);
    expect(await screen.findByText('Selamat Datang,')).toBeTruthy();
  });
});
