// Mock notifee: default export owns createChannel; AndroidImportance is a named
// export the module reads at load time. Use distinct sentinel numbers so we can
// assert HIGH vs DEFAULT mapping without importing the real native enum.
jest.mock('@notifee/react-native', () => ({
  __esModule: true,
  default: { createChannel: jest.fn().mockResolvedValue('chan') },
  AndroidImportance: { HIGH: 4, DEFAULT: 3 },
}));

import notifee from '@notifee/react-native';
import { CHANNELS, DEFAULT_CHANNEL_ID, ensureChannels } from './channels';

const mockCreateChannel = notifee.createChannel as jest.Mock;

beforeEach(() => jest.clearAllMocks());

describe('CHANNELS constant', () => {
  it('declares orders / approvals / general with expected importance', () => {
    expect(CHANNELS).toEqual([
      { id: 'orders', name: 'Pesanan', importance: 4 },
      { id: 'approvals', name: 'Persetujuan', importance: 4 },
      { id: 'general', name: 'Umum', importance: 3 },
    ]);
  });
  it('default channel id is "general"', () => {
    expect(DEFAULT_CHANNEL_ID).toBe('general');
  });
});

describe('ensureChannels', () => {
  it('creates one notifee channel per declared channel', async () => {
    await ensureChannels();
    expect(mockCreateChannel).toHaveBeenCalledTimes(3);
  });
  it('passes the exact id/name/importance for each channel', async () => {
    await ensureChannels();
    expect(mockCreateChannel).toHaveBeenCalledWith({
      id: 'orders',
      name: 'Pesanan',
      importance: 4,
    });
    expect(mockCreateChannel).toHaveBeenCalledWith({
      id: 'approvals',
      name: 'Persetujuan',
      importance: 4,
    });
    expect(mockCreateChannel).toHaveBeenCalledWith({
      id: 'general',
      name: 'Umum',
      importance: 3,
    });
  });
});
