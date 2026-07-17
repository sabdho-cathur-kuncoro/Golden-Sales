import { renderHook, act } from '@testing-library/react-native';
import { useDebounce } from './useDebounce';

// In @testing-library/react-native v14, renderHook/render/rerender AND act are
// async — await them. Timer advances must run inside an awaited async act() so
// the resulting state commit + effect flush before we assert.
describe('useDebounce', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  const advance = (ms: number) =>
    act(async () => {
      jest.advanceTimersByTime(ms);
    });

  it('returns the initial value immediately', async () => {
    const { result } = await renderHook(() => useDebounce('a', 300));
    expect(result.current).toBe('a');
  });

  it('updates only after the delay elapses', async () => {
    const { result, rerender } = await renderHook(({ v }: { v: string }) => useDebounce(v, 300), {
      initialProps: { v: 'a' },
    });
    await rerender({ v: 'b' });
    expect(result.current).toBe('a'); // not yet
    await advance(299);
    expect(result.current).toBe('a');
    await advance(1);
    expect(result.current).toBe('b');
  });

  it('resets the timer on rapid changes (only the last value lands)', async () => {
    const { result, rerender } = await renderHook(({ v }: { v: string }) => useDebounce(v, 300), {
      initialProps: { v: 'a' },
    });
    await rerender({ v: 'b' });
    await advance(200);
    await rerender({ v: 'c' });
    await advance(200);
    expect(result.current).toBe('a'); // timer restarted; 300 not yet reached for 'c'
    await advance(100);
    expect(result.current).toBe('c');
  });
});
