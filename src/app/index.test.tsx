// Local mocks: the bootstrap screen runs a boot sequence on mount (db.init,
// auth hydrate, remote version check). Stub the native/IO seams so the render
// exercises only the AnimatedSplash.
jest.mock('@/storage/db', () => ({
  __esModule: true,
  db: { init: jest.fn(async () => {}) },
}));
jest.mock('@/services/auth.services', () => ({
  __esModule: true,
  getProfileService: jest.fn(async () => ({})),
}));
jest.mock('@/services/global.services', () => ({
  __esModule: true,
  getAppVersionService: jest.fn(async () => ({})),
}));

import { render, screen } from '@testing-library/react-native';
import { useAuthStore } from '@/stores/auth.store';
import BootstrapScreen from './index';

describe('Bootstrap screen', () => {
  beforeEach(() => {
    // Avoid touching secure-store during hydrate.
    useAuthStore.setState({ hydrate: async () => {}, isAuthenticated: false });
  });

  it('mounts and shows the animated splash', async () => {
    await render(<BootstrapScreen />);
    expect(await screen.findByText('Golden')).toBeTruthy();
  });
});
