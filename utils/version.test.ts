// jest-expo defaults Platform.OS to 'ios', so isIOS is true here → openAppStore
// targets the App Store URLs. We spy on the real react-native Linking.openURL.
import { Linking } from 'react-native';
import { APPSTORE_APP_ID } from '../src/constants/version';
import { openAppStore } from './version';

const DEEP = `itms-apps://apps.apple.com/app/id${APPSTORE_APP_ID}`;
const WEB = `https://apps.apple.com/app/id${APPSTORE_APP_ID}`;

describe('openAppStore (ios env)', () => {
  // jest-expo already installs Linking.openURL as a global mock, so clear call
  // history before each test (restore alone reverts to that same recording mock).
  beforeEach(() => jest.clearAllMocks());
  afterEach(() => jest.restoreAllMocks());

  it('opens the native store deep link when it succeeds', async () => {
    const spy = jest.spyOn(Linking, 'openURL').mockResolvedValue(true as any);
    await openAppStore();
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(DEEP);
  });

  it('falls back to the https listing when the deep link rejects', async () => {
    const spy = jest
      .spyOn(Linking, 'openURL')
      .mockRejectedValueOnce(new Error('no store app'))
      .mockResolvedValueOnce(true as any);
    await openAppStore();
    expect(spy).toHaveBeenNthCalledWith(1, DEEP);
    expect(spy).toHaveBeenNthCalledWith(2, WEB);
  });

  it('swallows errors when both deep and web links reject', async () => {
    jest.spyOn(Linking, 'openURL').mockRejectedValue(new Error('boom'));
    await expect(openAppStore()).resolves.toBeUndefined();
  });
});
