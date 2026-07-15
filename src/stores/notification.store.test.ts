// The store's refetch() gates on the auth token and calls the count service.
// Mock both with inline jest.fn()s, then import the mocked modules so
// assertions target the same instances the store uses.
jest.mock('@/services/notification.services', () => ({
  getNotifCountService: jest.fn(),
}));
jest.mock('@/stores/auth.store', () => ({
  useAuthStore: { getState: jest.fn(() => ({ token: null })) },
}));

import { getNotifCountService } from '@/services/notification.services';
import { useAuthStore } from '@/stores/auth.store';
import {
  useNotificationStore,
  selectNotifUnread,
  refetchNotifCount,
} from './notification.store';

const countMock = getNotifCountService as jest.Mock;
const getStateMock = useAuthStore.getState as jest.Mock;

const setToken = (token: string | null) =>
  getStateMock.mockReturnValue({ token });

beforeEach(() => {
  useNotificationStore.setState({ unread: 0 });
  countMock.mockReset();
  setToken(null);
});

describe('refetch auth gate', () => {
  it('does not call the service when there is no token', async () => {
    setToken(null);
    await useNotificationStore.getState().refetch();
    expect(countMock).not.toHaveBeenCalled();
    expect(useNotificationStore.getState().unread).toBe(0);
  });
});

describe('refetch success', () => {
  it('sets unread from a flat { unread } payload', async () => {
    setToken('t');
    countMock.mockResolvedValue({ unread: 5 });
    await useNotificationStore.getState().refetch();
    expect(useNotificationStore.getState().unread).toBe(5);
  });

  it('reads unread from a nested { data: { unread } } payload', async () => {
    setToken('t');
    countMock.mockResolvedValue({ data: { unread: 7 } });
    await useNotificationStore.getState().refetch();
    expect(useNotificationStore.getState().unread).toBe(7);
  });

  it('falls back to 0 when the payload has no unread', async () => {
    setToken('t');
    useNotificationStore.setState({ unread: 9 });
    countMock.mockResolvedValue({});
    await useNotificationStore.getState().refetch();
    expect(useNotificationStore.getState().unread).toBe(0);
  });
});

describe('refetch failure', () => {
  it('swallows service errors and leaves unread unchanged', async () => {
    setToken('t');
    useNotificationStore.setState({ unread: 3 });
    countMock.mockRejectedValue(new Error('boom'));
    await expect(
      useNotificationStore.getState().refetch()
    ).resolves.toBeUndefined();
    expect(useNotificationStore.getState().unread).toBe(3);
  });
});

describe('selectNotifUnread', () => {
  it('returns the unread field from state', () => {
    useNotificationStore.setState({ unread: 4 });
    expect(selectNotifUnread(useNotificationStore.getState())).toBe(4);
  });
});

describe('refetchNotifCount helper', () => {
  it('delegates to the store refetch', async () => {
    setToken('t');
    countMock.mockResolvedValue({ unread: 2 });
    refetchNotifCount();
    // allow the fire-and-forget promise to resolve
    await Promise.resolve();
    await Promise.resolve();
    expect(countMock).toHaveBeenCalled();
  });
});
