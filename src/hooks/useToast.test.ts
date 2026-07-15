import { act, renderHook } from '@testing-library/react-native';
import { useToastStore } from '@/stores/toast.store';
import { useToast } from './useToast';

// Thin wrapper over the toast store — assert the returned helpers push a
// correctly-shaped toast into the real store.
beforeEach(() => useToastStore.setState({ toasts: [] }));

const last = () => useToastStore.getState().toasts.at(-1)!;

describe('useToast', () => {
  it('success pushes a green check-circle toast', async () => {
    const { result } = await renderHook(() => useToast());
    await act(async () => result.current.success('Judul', 'Pesan'));
    const t = last();
    expect(useToastStore.getState().toasts).toHaveLength(1);
    expect(t).toMatchObject({ title: 'Judul', message: 'Pesan', icon: 'check-circle' });
  });

  it('error pushes an error toast', async () => {
    const { result } = await renderHook(() => useToast());
    await act(async () => result.current.error('E', 'm'));
    expect(last()).toMatchObject({ icon: 'error', title: 'E', message: 'm' });
  });

  it('warning pushes a warning toast', async () => {
    const { result } = await renderHook(() => useToast());
    await act(async () => result.current.warning('W', 'm'));
    expect(last()).toMatchObject({ icon: 'warning' });
  });

  it('info pushes an info toast', async () => {
    const { result } = await renderHook(() => useToast());
    await act(async () => result.current.info('I', 'm'));
    expect(last()).toMatchObject({ icon: 'info' });
  });

  it('appends without clobbering earlier toasts', async () => {
    const { result } = await renderHook(() => useToast());
    await act(async () => {
      result.current.success('a', '1');
      result.current.warning('b', '2');
    });
    expect(useToastStore.getState().toasts).toHaveLength(2);
  });
});
