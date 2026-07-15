// Mock the native permission libs inline (factories can't close over outer
// vars — we grab the jest.fn()s back off the mocked module after import).
// jest-expo defaults Platform.OS to 'ios', so isAndroidBelow13() is always
// false here and every notification path goes through react-native-permissions.
jest.mock('react-native-permissions', () => ({
  checkNotifications: jest.fn(),
  requestNotifications: jest.fn(),
  openSettings: jest.fn(),
}));
jest.mock('react-native-vision-camera', () => ({
  Camera: {
    getCameraPermissionStatus: jest.fn(),
    requestCameraPermission: jest.fn(),
  },
}));

import { Camera } from 'react-native-vision-camera';
import {
  checkNotifications,
  openSettings,
  requestNotifications,
} from 'react-native-permissions';
import {
  checkCameraPermission,
  checkNotificationPermission,
  ensureCameraPermission,
  ensureNotificationFlow,
  ensureNotificationPermission,
  ensureScanFlow,
  isCameraBlocked,
  isNotificationBlocked,
  smartPermissionRequest,
} from './permissions';

const mockCheckNotifications = checkNotifications as jest.Mock;
const mockRequestNotifications = requestNotifications as jest.Mock;
const mockOpenSettings = openSettings as jest.Mock;
const mockGetCam = Camera.getCameraPermissionStatus as jest.Mock;
const mockRequestCam = Camera.requestCameraPermission as jest.Mock;

beforeEach(() => jest.clearAllMocks());

describe('checkNotificationPermission', () => {
  it('true only when status is granted', async () => {
    mockCheckNotifications.mockResolvedValue({ status: 'granted' });
    expect(await checkNotificationPermission()).toBe(true);
  });
  it('false for non-granted status', async () => {
    mockCheckNotifications.mockResolvedValue({ status: 'denied' });
    expect(await checkNotificationPermission()).toBe(false);
  });
  it('does not trigger a request (check-only)', async () => {
    mockCheckNotifications.mockResolvedValue({ status: 'denied' });
    await checkNotificationPermission();
    expect(mockRequestNotifications).not.toHaveBeenCalled();
  });
});

describe('isNotificationBlocked', () => {
  it('true only when status is blocked', async () => {
    mockCheckNotifications.mockResolvedValue({ status: 'blocked' });
    expect(await isNotificationBlocked()).toBe(true);
  });
  it('false when granted or denied', async () => {
    mockCheckNotifications.mockResolvedValue({ status: 'denied' });
    expect(await isNotificationBlocked()).toBe(false);
  });
});

describe('ensureNotificationPermission', () => {
  it('short-circuits true when already granted (no request)', async () => {
    mockCheckNotifications.mockResolvedValue({ status: 'granted' });
    expect(await ensureNotificationPermission()).toBe(true);
    expect(mockRequestNotifications).not.toHaveBeenCalled();
  });
  it('returns false and does not prompt when blocked', async () => {
    mockCheckNotifications.mockResolvedValue({ status: 'blocked' });
    expect(await ensureNotificationPermission()).toBe(false);
    expect(mockRequestNotifications).not.toHaveBeenCalled();
  });
  it('prompts when denied and returns the request outcome (granted)', async () => {
    mockCheckNotifications.mockResolvedValue({ status: 'denied' });
    mockRequestNotifications.mockResolvedValue({ status: 'granted' });
    expect(await ensureNotificationPermission()).toBe(true);
    expect(mockRequestNotifications).toHaveBeenCalledWith(['alert', 'sound']);
  });
  it('prompts when denied and returns false when still not granted', async () => {
    mockCheckNotifications.mockResolvedValue({ status: 'denied' });
    mockRequestNotifications.mockResolvedValue({ status: 'denied' });
    expect(await ensureNotificationPermission()).toBe(false);
  });
});

describe('checkCameraPermission', () => {
  it('true only when granted', async () => {
    mockGetCam.mockResolvedValue('granted');
    expect(await checkCameraPermission()).toBe(true);
  });
  it('false otherwise', async () => {
    mockGetCam.mockResolvedValue('not-determined');
    expect(await checkCameraPermission()).toBe(false);
  });
});

describe('isCameraBlocked', () => {
  it('true for denied or restricted', async () => {
    mockGetCam.mockResolvedValueOnce('denied');
    expect(await isCameraBlocked()).toBe(true);
    mockGetCam.mockResolvedValueOnce('restricted');
    expect(await isCameraBlocked()).toBe(true);
  });
  it('false for granted / not-determined', async () => {
    mockGetCam.mockResolvedValueOnce('granted');
    expect(await isCameraBlocked()).toBe(false);
    mockGetCam.mockResolvedValueOnce('not-determined');
    expect(await isCameraBlocked()).toBe(false);
  });
});

describe('ensureCameraPermission', () => {
  it('short-circuits true when granted (no request)', async () => {
    mockGetCam.mockResolvedValue('granted');
    expect(await ensureCameraPermission()).toBe(true);
    expect(mockRequestCam).not.toHaveBeenCalled();
  });
  it('requests when not granted and returns granted result', async () => {
    mockGetCam.mockResolvedValue('not-determined');
    mockRequestCam.mockResolvedValue('granted');
    expect(await ensureCameraPermission()).toBe(true);
    expect(mockRequestCam).toHaveBeenCalledTimes(1);
  });
  it('requests when not granted and returns false when denied', async () => {
    mockGetCam.mockResolvedValue('denied');
    mockRequestCam.mockResolvedValue('denied');
    expect(await ensureCameraPermission()).toBe(false);
  });
});

describe('feature-flow wrappers', () => {
  it('ensureScanFlow delegates to camera permission', async () => {
    mockGetCam.mockResolvedValue('granted');
    expect(await ensureScanFlow()).toBe(true);
  });
  it('ensureNotificationFlow delegates to notification permission', async () => {
    mockCheckNotifications.mockResolvedValue({ status: 'granted' });
    expect(await ensureNotificationFlow()).toBe(true);
  });
});

describe('smartPermissionRequest', () => {
  it('returns true immediately when the request grants (no settings, no block check)', async () => {
    const requestFn = jest.fn().mockResolvedValue(true);
    const isBlocked = jest.fn();
    expect(await smartPermissionRequest({ requestFn, isBlocked })).toBe(true);
    expect(isBlocked).not.toHaveBeenCalled();
    expect(mockOpenSettings).not.toHaveBeenCalled();
  });
  it('opens Settings when denied and permanently blocked', async () => {
    const requestFn = jest.fn().mockResolvedValue(false);
    const isBlocked = jest.fn().mockResolvedValue(true);
    expect(await smartPermissionRequest({ requestFn, isBlocked })).toBe(false);
    expect(mockOpenSettings).toHaveBeenCalledTimes(1);
  });
  it('does not open Settings when denied but not blocked', async () => {
    const requestFn = jest.fn().mockResolvedValue(false);
    const isBlocked = jest.fn().mockResolvedValue(false);
    expect(await smartPermissionRequest({ requestFn, isBlocked })).toBe(false);
    expect(mockOpenSettings).not.toHaveBeenCalled();
  });
  it('does not open Settings when no isBlocked probe is provided', async () => {
    const requestFn = jest.fn().mockResolvedValue(false);
    expect(await smartPermissionRequest({ requestFn })).toBe(false);
    expect(mockOpenSettings).not.toHaveBeenCalled();
  });
});
