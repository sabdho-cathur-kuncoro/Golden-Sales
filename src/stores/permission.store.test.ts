// Mock the native permission flows so the store's setters can be asserted in
// isolation. Define jest.fn()s inline in the factory, then import the mocked
// module so assertions target the same instances the store calls.
jest.mock('../../utils/permissions', () => ({
  ensureScanFlow: jest.fn(),
  ensureNotificationFlow: jest.fn(),
}));

import { ensureNotificationFlow, ensureScanFlow } from '../../utils/permissions';
import { usePermissionStore } from './permission.store';

const scanMock = ensureScanFlow as jest.Mock;
const notifMock = ensureNotificationFlow as jest.Mock;

beforeEach(() => {
  usePermissionStore.setState({
    cameraGranted: false,
    notificationGranted: false,
  });
  scanMock.mockReset();
  notifMock.mockReset();
});

describe('requestCamera', () => {
  it('reflects a granted result in state', async () => {
    scanMock.mockResolvedValue(true);
    const res = await usePermissionStore.getState().requestCamera();
    expect(res).toBe(true);
    expect(usePermissionStore.getState().cameraGranted).toBe(true);
  });

  it('reflects a denied result in state', async () => {
    scanMock.mockResolvedValue(false);
    const res = await usePermissionStore.getState().requestCamera();
    expect(res).toBe(false);
    expect(usePermissionStore.getState().cameraGranted).toBe(false);
  });
});

describe('requestNotification', () => {
  it('reflects a granted result in state', async () => {
    notifMock.mockResolvedValue(true);
    const res = await usePermissionStore.getState().requestNotification();
    expect(res).toBe(true);
    expect(usePermissionStore.getState().notificationGranted).toBe(true);
  });
});

describe('requestAll', () => {
  it('is true only when both flows grant', async () => {
    scanMock.mockResolvedValue(true);
    notifMock.mockResolvedValue(true);
    const res = await usePermissionStore.getState().requestAll();
    expect(res).toBe(true);
    const s = usePermissionStore.getState();
    expect(s.cameraGranted).toBe(true);
    expect(s.notificationGranted).toBe(true);
  });

  it('is false when one flow denies, but still records each result', async () => {
    scanMock.mockResolvedValue(true);
    notifMock.mockResolvedValue(false);
    const res = await usePermissionStore.getState().requestAll();
    expect(res).toBe(false);
    const s = usePermissionStore.getState();
    expect(s.cameraGranted).toBe(true);
    expect(s.notificationGranted).toBe(false);
  });
});
