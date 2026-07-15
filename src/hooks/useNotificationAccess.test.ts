// Mock the permissions util; drive the real pre-permission modal store.
jest.mock('../../utils/permissions', () => ({
  __esModule: true,
  checkNotificationPermission: jest.fn(),
  isNotificationBlocked: jest.fn(),
  smartPermissionRequest: jest.fn(),
}));

import { act, renderHook, waitFor } from '@testing-library/react-native';
import { usePrePermissionModal } from '@/stores/prePermission.store';
import {
  checkNotificationPermission,
  smartPermissionRequest,
} from '../../utils/permissions';
import { useNotificationAccess } from './useNotificationAccess';

const checkMock = checkNotificationPermission as jest.Mock;
const smartMock = smartPermissionRequest as jest.Mock;

beforeEach(() => {
  checkMock.mockReset();
  smartMock.mockReset();
  usePrePermissionModal.setState({ visible: false, options: undefined });
});

describe('useNotificationAccess.request', () => {
  it('short-circuits true (no modal) when already granted', async () => {
    checkMock.mockResolvedValue(true);
    const { result } = await renderHook(() => useNotificationAccess());
    let resolved: boolean | undefined;
    await act(async () => {
      resolved = await result.current.request();
    });
    expect(resolved).toBe(true);
    expect(usePrePermissionModal.getState().visible).toBe(false);
  });

  it('shows the priming modal and resolves the smart-request result on confirm', async () => {
    checkMock.mockResolvedValue(false);
    smartMock.mockResolvedValue(true);
    const { result } = await renderHook(() => useNotificationAccess());

    let p!: Promise<boolean>;
    await act(async () => {
      p = result.current.request();
    });
    await waitFor(() => expect(usePrePermissionModal.getState().visible).toBe(true));
    const opts = usePrePermissionModal.getState().options!;
    expect(opts.title).toBe('Hidupkan Notifikasi');

    await act(async () => {
      await opts.onConfirm();
    });
    expect(smartMock).toHaveBeenCalledWith(
      expect.objectContaining({ requestFn: expect.any(Function) })
    );
    await expect(p).resolves.toBe(true);
  });

  it('resolves false on cancel', async () => {
    checkMock.mockResolvedValue(false);
    const { result } = await renderHook(() => useNotificationAccess());
    let p!: Promise<boolean>;
    await act(async () => {
      p = result.current.request();
    });
    await waitFor(() => expect(usePrePermissionModal.getState().options).toBeDefined());
    await act(async () => {
      await usePrePermissionModal.getState().options!.onCancel();
    });
    await expect(p).resolves.toBe(false);
  });
});
