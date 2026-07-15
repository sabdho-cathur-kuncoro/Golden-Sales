import { act, renderHook } from '@testing-library/react-native';
import { useLoadingStore } from '@/stores/loading.store';
import { useLoading } from './useLoading';

// Thin wrapper over the loading store — assert show/hide drive `visible`.
beforeEach(() =>
  useLoadingStore.setState({ visible: false, message: undefined, startedAt: null })
);

describe('useLoading', () => {
  it('exposes the store show/hide actions', async () => {
    const { result } = await renderHook(() => useLoading());
    expect(result.current.show).toBe(useLoadingStore.getState().showLoading);
    expect(result.current.hide).toBe(useLoadingStore.getState().hideLoading);
  });

  it('show() makes the loader visible with a message', async () => {
    const { result } = await renderHook(() => useLoading());
    await act(async () => result.current.show({ message: 'Memuat…' }));
    expect(useLoadingStore.getState().visible).toBe(true);
    expect(useLoadingStore.getState().message).toBe('Memuat…');
  });

  it('hide() clears visibility (past min-duration)', async () => {
    jest.useFakeTimers();
    const { result } = await renderHook(() => useLoading());
    await act(async () => result.current.show());
    await act(async () => {
      result.current.hide();
      jest.advanceTimersByTime(1000);
    });
    expect(useLoadingStore.getState().visible).toBe(false);
    jest.useRealTimers();
  });
});
