// Mock the secure-storage layer; assert the store's in-memory transitions and
// that it persists through the storage abstraction (no expo-secure-store).
// Define the jest.fn()s inline in the factory, then import the mocked module so
// assertions target the exact same instances the store calls.
jest.mock('@/storage/auth.storage', () => ({
  authStorage: { set: jest.fn(), get: jest.fn(), clear: jest.fn() },
}));

import { authStorage } from '@/storage/auth.storage';
import { useAuthStore } from './auth.store';

const setMock = authStorage.set as jest.Mock;
const getMock = authStorage.get as jest.Mock;
const clearMock = authStorage.clear as jest.Mock;

const reset = () =>
  useAuthStore.setState({
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
    isHydrated: false,
  });

beforeEach(() => {
  reset();
  setMock.mockReset().mockResolvedValue(undefined);
  getMock.mockReset().mockResolvedValue(null);
  clearMock.mockReset().mockResolvedValue(undefined);
});

describe('login', () => {
  it('sets in-memory session synchronously, then persists', async () => {
    const p = useAuthStore.getState().login({ token: 't', user: { id: 1 } });
    // synchronous read must already see the session (interceptor requirement)
    expect(useAuthStore.getState().token).toBe('t');
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    await p;
    expect(setMock).toHaveBeenCalledWith({ accessToken: 't', refreshToken: undefined, user: { id: 1 } });
  });
});

describe('hydrate', () => {
  it('restores session when storage has an access token', async () => {
    getMock.mockResolvedValueOnce({ accessToken: 't', refreshToken: 'r', user: { id: 9 } });
    await useAuthStore.getState().hydrate();
    const s = useAuthStore.getState();
    expect(s.token).toBe('t');
    expect(s.user).toEqual({ id: 9 });
    expect(s.isAuthenticated).toBe(true);
    expect(s.isHydrated).toBe(true);
  });
  it('marks hydrated even with no stored session', async () => {
    getMock.mockResolvedValueOnce(null);
    await useAuthStore.getState().hydrate();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().isHydrated).toBe(true);
  });
});

describe('setUser', () => {
  it('no-ops without a token', async () => {
    await useAuthStore.getState().setUser({ id: 1 });
    expect(useAuthStore.getState().user).toBeNull();
    expect(setMock).not.toHaveBeenCalled();
  });
  it('preserves topic from the previous user when /me omits it', async () => {
    useAuthStore.setState({ token: 't', user: { id: 1, topic: 'sales' } });
    await useAuthStore.getState().setUser({ id: 1, name: 'Budi' });
    expect(useAuthStore.getState().user).toMatchObject({ name: 'Budi', topic: 'sales' });
  });
  it('uses the new topic when provided', async () => {
    useAuthStore.setState({ token: 't', user: { id: 1, topic: 'old' } });
    await useAuthStore.getState().setUser({ id: 1, topic: 'new' });
    expect(useAuthStore.getState().user).toMatchObject({ topic: 'new' });
  });
});

describe('logout', () => {
  it('clears storage and resets session', async () => {
    useAuthStore.setState({ token: 't', user: { id: 1 }, isAuthenticated: true });
    await useAuthStore.getState().logout();
    expect(clearMock).toHaveBeenCalled();
    const s = useAuthStore.getState();
    expect(s.token).toBeNull();
    expect(s.user).toBeNull();
    expect(s.isAuthenticated).toBe(false);
  });
});
