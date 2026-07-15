// notifee default owns displayNotification; AndroidImportance is needed because
// display.ts transitively imports ./channels which reads it at load time.
jest.mock('@notifee/react-native', () => ({
  __esModule: true,
  default: { displayNotification: jest.fn().mockResolvedValue(undefined) },
  AndroidImportance: { HIGH: 4, DEFAULT: 3 },
}));
// Mock the tray resolver so we control the deterministic id per test.
jest.mock('./tray', () => ({ resolveTrayId: jest.fn() }));

import notifee from '@notifee/react-native';
import { displayFcmMessage } from './display';
import { resolveTrayId } from './tray';

const mockDisplay = notifee.displayNotification as jest.Mock;
const mockResolveTrayId = resolveTrayId as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockResolveTrayId.mockReturnValue(undefined);
});

describe('displayFcmMessage', () => {
  it('renders title/body/channel from the FCM data payload', async () => {
    mockResolveTrayId.mockReturnValue('n1');
    await displayFcmMessage({
      data: { title: 'T', body: 'B', channelId: 'orders', notifId: 'n1' },
    } as any);

    expect(mockDisplay).toHaveBeenCalledTimes(1);
    const arg = mockDisplay.mock.calls[0][0];
    expect(arg.title).toBe('T');
    expect(arg.body).toBe('B');
    expect(arg.android.channelId).toBe('orders');
  });

  it('falls back to notification.title/body and DEFAULT_CHANNEL_ID', async () => {
    await displayFcmMessage({
      data: {},
      notification: { title: 'NT', body: 'NB' },
    } as any);

    const arg = mockDisplay.mock.calls[0][0];
    expect(arg.title).toBe('NT');
    expect(arg.body).toBe('NB');
    expect(arg.android.channelId).toBe('general'); // DEFAULT_CHANNEL_ID
  });

  it('defaults title/body to empty strings when nothing is present', async () => {
    await displayFcmMessage({ data: {} } as any);
    const arg = mockDisplay.mock.calls[0][0];
    expect(arg.title).toBe('');
    expect(arg.body).toBe('');
  });

  it('sets the stable id and mirrors trayId back into data.notifId', async () => {
    mockResolveTrayId.mockReturnValue('tray-42');
    const data: Record<string, string> = { title: 'T', body: 'B' };
    await displayFcmMessage({ data } as any);

    const arg = mockDisplay.mock.calls[0][0];
    expect(arg.id).toBe('tray-42');
    expect(arg.data.notifId).toBe('tray-42'); // mirrored into the data map
  });

  it('omits the id and does not mutate notifId when no trayId resolves', async () => {
    mockResolveTrayId.mockReturnValue(undefined);
    await displayFcmMessage({ data: { title: 'T' } } as any);

    const arg = mockDisplay.mock.calls[0][0];
    expect('id' in arg).toBe(false);
    expect(arg.data.notifId).toBeUndefined();
  });

  it('always applies the android presentation config', async () => {
    await displayFcmMessage({ data: { title: 'T' } } as any);
    const arg = mockDisplay.mock.calls[0][0];
    expect(arg.android).toMatchObject({
      pressAction: { id: 'default', launchActivity: 'default' },
      smallIcon: 'ic_notification',
      color: '#B20605',
    });
  });
});
