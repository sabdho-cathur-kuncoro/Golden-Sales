// Mock the permissions util so no native check runs; drive the pre-permission
// modal through its real Zustand store and assert the request() resolution.
jest.mock('../../utils/permissions', () => ({
  __esModule: true,
  checkCameraPermission: jest.fn(),
  smartPermissionRequest: jest.fn(),
}));

import { act, renderHook, waitFor } from '@testing-library/react-native';
import { usePrePermissionModal } from '@/stores/prePermission.store';
import {
  checkCameraPermission,
  smartPermissionRequest,
} from '../../utils/permissions';
import { useCameraAccess } from './useCameraAccess';

const checkMock = checkCameraPermission as jest.Mock;
const smartMock = smartPermissionRequest as jest.Mock;

beforeEach(() => {
  checkMock.mockReset();
  smartMock.mockReset();
  usePrePermissionModal.setState({ visible: false, options: undefined });
});

describe('useCameraAccess.request', () => {
  it('short-circuits true (no modal) when already granted', async () => {
    checkMock.mockResolvedValue(true);
    const { result } = await renderHook(() => useCameraAccess());
    let resolved: boolean | undefined;
    await act(async () => {
      resolved = await result.current.request();
    });
    expect(resolved).toBe(true);
    expect(usePrePermissionModal.getState().visible).toBe(false);
    expect(smartMock).not.toHaveBeenCalled();
  });

  it('shows the modal and resolves true when the user confirms + grant succeeds', async () => {
    checkMock.mockResolvedValue(false);
    smartMock.mockResolvedValue(true);
    const { result } = await renderHook(() => useCameraAccess());

    let p!: Promise<boolean>;
    await act(async () => {
      p = result.current.request();
    });

    await waitFor(() => expect(usePrePermissionModal.getState().visible).toBe(true));
    const opts = usePrePermissionModal.getState().options!;
    expect(opts.title).toBe('Izin akses kamera');

    await act(async () => {
      await opts.onConfirm();
    });
    expect(smartMock).toHaveBeenCalled();
    await expect(p).resolves.toBe(true);
  });

  it('resolves false when the user cancels the modal', async () => {
    checkMock.mockResolvedValue(false);
    const { result } = await renderHook(() => useCameraAccess());

    let p!: Promise<boolean>;
    await act(async () => {
      p = result.current.request();
    });
    await waitFor(() => expect(usePrePermissionModal.getState().options).toBeDefined());

    await act(async () => {
      await usePrePermissionModal.getState().options!.onCancel();
    });
    await expect(p).resolves.toBe(false);
    expect(smartMock).not.toHaveBeenCalled();
  });
});
