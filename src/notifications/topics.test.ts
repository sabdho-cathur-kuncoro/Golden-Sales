// topics.ts pulls the push transport services and the auth store at module
// scope. Mock both inline; grab the jest.fn()s back off the mocked modules.
jest.mock('@/services/push.services', () => ({
  subscribeTopic: jest.fn().mockResolvedValue(undefined),
  unsubscribeTopic: jest.fn().mockResolvedValue(undefined),
  subscribeTokenWithBackend: jest.fn().mockResolvedValue(undefined),
  unsubscribeTokenWithBackend: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('@/stores/auth.store', () => ({
  useAuthStore: { getState: jest.fn() },
}));

import {
  subscribeTokenWithBackend,
  subscribeTopic,
  unsubscribeTokenWithBackend,
  unsubscribeTopic,
} from '@/services/push.services';
import { useAuthStore } from '@/stores/auth.store';
import {
  DEFAULT_TOPICS,
  currentTopics,
  subscribeAllTopics,
  unsubscribeAllTopics,
} from './topics';

const mockGetState = useAuthStore.getState as jest.Mock;
const mockSubTopic = subscribeTopic as jest.Mock;
const mockUnsubTopic = unsubscribeTopic as jest.Mock;
const mockSubBackend = subscribeTokenWithBackend as jest.Mock;
const mockUnsubBackend = unsubscribeTokenWithBackend as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockGetState.mockReturnValue({ user: null });
});

describe('DEFAULT_TOPICS', () => {
  it('is exactly ["sales"]', () => {
    expect(DEFAULT_TOPICS).toEqual(['sales']);
  });
});

describe('currentTopics', () => {
  it('returns just the defaults when the user has no topic', () => {
    mockGetState.mockReturnValue({ user: { topic: undefined } });
    expect(currentTopics()).toEqual(['sales']);
  });
  it('returns defaults when there is no user at all', () => {
    mockGetState.mockReturnValue({ user: null });
    expect(currentTopics()).toEqual(['sales']);
  });
  it('appends the per-user topic when present', () => {
    mockGetState.mockReturnValue({ user: { topic: 'SLS0016' } });
    expect(currentTopics()).toEqual(['sales', 'SLS0016']);
  });
});

describe('subscribeAllTopics', () => {
  it('subscribes each topic on both device FCM and backend', async () => {
    await subscribeAllTopics(['sales', 'SLS0016']);
    expect(mockSubTopic).toHaveBeenCalledWith('sales');
    expect(mockSubTopic).toHaveBeenCalledWith('SLS0016');
    expect(mockSubBackend).toHaveBeenCalledWith('sales');
    expect(mockSubBackend).toHaveBeenCalledWith('SLS0016');
    expect(mockSubTopic).toHaveBeenCalledTimes(2);
    expect(mockSubBackend).toHaveBeenCalledTimes(2);
  });
  it('defaults to currentTopics() when called with no args', async () => {
    mockGetState.mockReturnValue({ user: { topic: 'SLS0016' } });
    await subscribeAllTopics();
    expect(mockSubTopic).toHaveBeenCalledWith('sales');
    expect(mockSubTopic).toHaveBeenCalledWith('SLS0016');
  });
  it('swallows backend subscription errors (device sub still resolves)', async () => {
    mockSubBackend.mockRejectedValueOnce(new Error('backend down'));
    await expect(subscribeAllTopics(['sales'])).resolves.toBeUndefined();
    expect(mockSubTopic).toHaveBeenCalledWith('sales');
  });
});

describe('unsubscribeAllTopics', () => {
  it('unsubscribes each topic on both device FCM and backend', async () => {
    await unsubscribeAllTopics(['sales', 'SLS0016']);
    expect(mockUnsubTopic).toHaveBeenCalledWith('sales');
    expect(mockUnsubTopic).toHaveBeenCalledWith('SLS0016');
    expect(mockUnsubBackend).toHaveBeenCalledWith('sales');
    expect(mockUnsubBackend).toHaveBeenCalledWith('SLS0016');
  });
  it('swallows backend unsubscription errors', async () => {
    mockUnsubBackend.mockRejectedValueOnce(new Error('backend down'));
    await expect(unsubscribeAllTopics(['sales'])).resolves.toBeUndefined();
    expect(mockUnsubTopic).toHaveBeenCalledWith('sales');
  });
});
