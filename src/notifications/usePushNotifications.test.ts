// Foreground push wiring — auth-gated effect that ensures channels, requests
// permission, subscribes topics, and wires the FCM/notifee listeners. Every
// collaborator is mocked; firebase + notifee come from the global jest.setup.js.

jest.mock('./channels', () => ({ __esModule: true, ensureChannels: jest.fn(async () => {}) }));
jest.mock('./display', () => ({ __esModule: true, displayFcmMessage: jest.fn(async () => {}) }));
jest.mock('./navigation', () => ({ __esModule: true, handleNotificationOpen: jest.fn(async () => {}) }));
jest.mock('./topics', () => ({
  __esModule: true,
  currentTopics: jest.fn(() => ['sales', 'SLS0016']),
  subscribeAllTopics: jest.fn(async () => {}),
}));
jest.mock('@/services/push.services', () => ({
  __esModule: true,
  subscribeTokenWithBackend: jest.fn(async () => {}),
}));
jest.mock('@/hooks/useNotificationAccess', () => {
  const request = jest.fn(async () => true);
  return { __esModule: true, useNotificationAccess: () => ({ request }) };
});
jest.mock('@/stores/notification.store', () => ({
  __esModule: true,
  useNotificationStore: { getState: () => ({ refetch: jest.fn() }) },
}));
// Selector-style auth store backed by a mutable state object.
jest.mock('@/stores/auth.store', () => {
  const state: any = { isAuthenticated: false, user: null };
  const useAuthStore: any = (sel: any) => sel(state);
  useAuthStore.getState = () => state;
  useAuthStore.setState = (partial: any) => Object.assign(state, partial);
  return { __esModule: true, useAuthStore };
});

import { act, renderHook, waitFor } from '@testing-library/react-native';
import {
  onMessage,
  onNotificationOpenedApp,
  onTokenRefresh,
} from '@react-native-firebase/messaging';
import { useNotificationAccess } from '@/hooks/useNotificationAccess';
import { useAuthStore } from '@/stores/auth.store';
import { ensureChannels } from './channels';
import { subscribeAllTopics } from './topics';
import { usePushNotifications } from './usePushNotifications';

const ensureChannelsMock = ensureChannels as jest.Mock;
const subscribeAllTopicsMock = subscribeAllTopics as jest.Mock;
const onMessageMock = onMessage as jest.Mock;
const onOpenedMock = onNotificationOpenedApp as jest.Mock;
const onTokenRefreshMock = onTokenRefresh as jest.Mock;
const request = useNotificationAccess().request as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  request.mockResolvedValue(true);
  (useAuthStore as any).setState({ isAuthenticated: false, user: null });
});

describe('usePushNotifications', () => {
  it('does no wiring while unauthenticated', async () => {
    await act(async () => {
      await renderHook(() => usePushNotifications());
    });
    expect(ensureChannelsMock).not.toHaveBeenCalled();
    expect(subscribeAllTopicsMock).not.toHaveBeenCalled();
    expect(onMessageMock).not.toHaveBeenCalled();
  });

  it('ensures channels, requests permission, subscribes topics, and wires listeners when authenticated', async () => {
    (useAuthStore as any).setState({ isAuthenticated: true, user: { topic: 'SLS0016' } });
    await act(async () => {
      await renderHook(() => usePushNotifications());
    });

    await waitFor(() => expect(subscribeAllTopicsMock).toHaveBeenCalled());
    expect(ensureChannelsMock).toHaveBeenCalled();
    expect(request).toHaveBeenCalled();
    expect(subscribeAllTopicsMock).toHaveBeenCalledWith(['sales', 'SLS0016']);
    expect(onMessageMock).toHaveBeenCalled();
    expect(onOpenedMock).toHaveBeenCalled();
    expect(onTokenRefreshMock).toHaveBeenCalled();
  });

  it('bails out before wiring listeners when permission is denied', async () => {
    request.mockResolvedValue(false);
    (useAuthStore as any).setState({ isAuthenticated: true, user: { topic: 'SLS0016' } });
    await act(async () => {
      await renderHook(() => usePushNotifications());
    });

    await waitFor(() => expect(request).toHaveBeenCalled());
    expect(ensureChannelsMock).toHaveBeenCalled();
    expect(subscribeAllTopicsMock).not.toHaveBeenCalled();
    expect(onMessageMock).not.toHaveBeenCalled();
  });

  it('tears down listener subscriptions on unmount', async () => {
    const unsub = jest.fn();
    onMessageMock.mockReturnValue(unsub);
    (useAuthStore as any).setState({ isAuthenticated: true, user: { topic: 'SLS0016' } });

    let unmount!: () => void;
    await act(async () => {
      ({ unmount } = await renderHook(() => usePushNotifications()));
    });
    await waitFor(() => expect(onMessageMock).toHaveBeenCalled());

    await act(async () => {
      unmount();
    });
    expect(unsub).toHaveBeenCalled();
  });
});
