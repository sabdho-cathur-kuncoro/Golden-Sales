import { act, renderHook } from '@testing-library/react-native';
import { useLogin } from './useLogin';

// Stub hook: loading toggle around a (currently commented-out) login call.
describe('useLogin', () => {
  it('starts not loading', async () => {
    const { result } = await renderHook(() => useLogin());
    expect(result.current.loading).toBe(false);
    expect(typeof result.current.handleLogin).toBe('function');
  });

  it('resets loading to false after handleLogin resolves', async () => {
    const { result } = await renderHook(() => useLogin());
    await act(async () => {
      await result.current.handleLogin('a@b.com', 'pw');
    });
    expect(result.current.loading).toBe(false);
  });

  it('handleLogin resolves without throwing', async () => {
    const { result } = await renderHook(() => useLogin());
    await act(async () => {
      await expect(result.current.handleLogin('a@b.com', 'pw')).resolves.toBeUndefined();
    });
  });
});
