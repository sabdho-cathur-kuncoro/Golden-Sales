jest.mock('@/constants/API', () => ({ Config: { URL: 'http://test', BASE_URL: 'http://test/sales' } }));
jest.mock('@/stores/auth.store', () => ({
  useAuthStore: { getState: () => ({ token: 'tok-123' }) },
}));
jest.mock('@notifee/react-native', () => ({
  __esModule: true,
  default: { requestPermission: jest.fn() },
  AuthorizationStatus: { DENIED: 0, AUTHORIZED: 1, PROVISIONAL: 2, NOT_DETERMINED: -1 },
}));
jest.mock('@react-native-firebase/app', () => ({ getApp: jest.fn(() => ({})) }));
jest.mock('@react-native-firebase/messaging', () => ({
  getMessaging: jest.fn(() => ({})),
  getToken: jest.fn(),
  subscribeToTopic: jest.fn(),
  unsubscribeFromTopic: jest.fn(),
}));
jest.mock('axios', () => ({ __esModule: true, default: { post: jest.fn() } }));

import notifee from '@notifee/react-native';
import {
  getToken,
  subscribeToTopic,
  unsubscribeFromTopic,
} from '@react-native-firebase/messaging';
import { STATUS_MESSAGES } from '@/utils/apiError';
import axios from 'axios';
import {
  getFcmToken,
  requestPushPermission,
  subscribeTokenWithBackend,
  subscribeTopic,
  unsubscribeTokenWithBackend,
  unsubscribeTopic,
} from './push.services';

const requestPermission = (notifee as any).requestPermission as jest.Mock;
const getTokenMock = getToken as jest.Mock;
const subscribeToTopicMock = subscribeToTopic as jest.Mock;
const unsubscribeFromTopicMock = unsubscribeFromTopic as jest.Mock;
const axiosPost = (axios as any).post as jest.Mock;
const SERVER_ERR = STATUS_MESSAGES[500];

beforeEach(() => jest.clearAllMocks());

describe('requestPushPermission', () => {
  it('returns true when AUTHORIZED', async () => {
    requestPermission.mockResolvedValueOnce({ authorizationStatus: 1 });
    expect(await requestPushPermission()).toBe(true);
  });
  it('returns true when PROVISIONAL', async () => {
    requestPermission.mockResolvedValueOnce({ authorizationStatus: 2 });
    expect(await requestPushPermission()).toBe(true);
  });
  it('returns false when DENIED', async () => {
    requestPermission.mockResolvedValueOnce({ authorizationStatus: 0 });
    expect(await requestPushPermission()).toBe(false);
  });
  it('returns false (swallows) on error', async () => {
    requestPermission.mockRejectedValueOnce(new Error('boom'));
    expect(await requestPushPermission()).toBe(false);
  });
});

describe('getFcmToken', () => {
  it('returns the token', async () => {
    getTokenMock.mockResolvedValueOnce('fcm-abc');
    expect(await getFcmToken()).toBe('fcm-abc');
    expect(getTokenMock).toHaveBeenCalledTimes(1);
  });
  it('returns null (swallows) on error', async () => {
    getTokenMock.mockRejectedValueOnce(new Error('no token'));
    expect(await getFcmToken()).toBeNull();
  });
});

describe('subscribeTopic', () => {
  it('subscribes to the topic', async () => {
    subscribeToTopicMock.mockResolvedValueOnce(undefined);
    await subscribeTopic('sales');
    expect(subscribeToTopicMock).toHaveBeenCalledWith({}, 'sales');
  });
  it('swallows errors', async () => {
    subscribeToTopicMock.mockRejectedValueOnce(new Error('x'));
    await expect(subscribeTopic('sales')).resolves.toBeUndefined();
  });
});

describe('unsubscribeTopic', () => {
  it('unsubscribes from the topic', async () => {
    unsubscribeFromTopicMock.mockResolvedValueOnce(undefined);
    await unsubscribeTopic('sales');
    expect(unsubscribeFromTopicMock).toHaveBeenCalledWith({}, 'sales');
  });
  it('swallows errors', async () => {
    unsubscribeFromTopicMock.mockRejectedValueOnce(new Error('x'));
    await expect(unsubscribeTopic('sales')).resolves.toBeUndefined();
  });
});

describe('subscribeTokenWithBackend', () => {
  it('POSTs token+topic to the subscribe endpoint', async () => {
    axiosPost.mockResolvedValueOnce({ status: 200, data: {} });
    await subscribeTokenWithBackend('sales');
    expect(axiosPost).toHaveBeenCalledWith('http://test/dev/fcm/subscribe', {
      token: 'tok-123',
      topic: 'sales',
    });
  });
  it('throws mapped message on failure', async () => {
    axiosPost.mockRejectedValueOnce({ response: { status: 500 } });
    await expect(subscribeTokenWithBackend('sales')).rejects.toThrow(SERVER_ERR);
  });
});

describe('unsubscribeTokenWithBackend', () => {
  it('POSTs token+topic to the unsubscribe endpoint', async () => {
    axiosPost.mockResolvedValueOnce({ status: 200, data: {} });
    await unsubscribeTokenWithBackend('sales');
    expect(axiosPost).toHaveBeenCalledWith('http://test/dev/fcm/unsubscribe', {
      token: 'tok-123',
      topic: 'sales',
    });
  });
  it('throws mapped message on failure', async () => {
    axiosPost.mockRejectedValueOnce({ response: { status: 500 } });
    await expect(unsubscribeTokenWithBackend('sales')).rejects.toThrow(SERVER_ERR);
  });
});
