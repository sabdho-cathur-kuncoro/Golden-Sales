import { useToastStore, type ToastPayload } from './toast.store';

const payload: Omit<ToastPayload, 'id'> = {
  title: 'Hi',
  message: 'World',
  icon: 'info',
  color: '#000',
  borderColor: '#111',
  fromBGColor: '#222',
  toBGColor: '#333',
};

beforeEach(() => useToastStore.setState({ toasts: [], duration: 3000 }));

describe('showToast', () => {
  it('appends a toast with a generated id and default duration', () => {
    useToastStore.getState().showToast(payload);
    const s = useToastStore.getState();
    expect(s.toasts).toHaveLength(1);
    expect(s.toasts[0]).toMatchObject(payload);
    expect(typeof s.toasts[0].id).toBe('number');
    expect(s.duration).toBe(3000);
  });

  it('honours a custom duration and stacks multiple toasts', () => {
    useToastStore.getState().showToast(payload, 5000);
    useToastStore.getState().showToast(payload, 5000);
    const s = useToastStore.getState();
    expect(s.duration).toBe(5000);
    expect(s.toasts).toHaveLength(2);
  });
});

describe('removeToast', () => {
  it('removes only the toast with the matching id', () => {
    // id is Date.now(); force distinct values so removal is unambiguous.
    const nowSpy = jest
      .spyOn(Date, 'now')
      .mockReturnValueOnce(1000)
      .mockReturnValueOnce(2000);
    useToastStore.getState().showToast(payload);
    const id = useToastStore.getState().toasts[0].id;
    useToastStore.getState().showToast(payload);
    useToastStore.getState().removeToast(id);
    const s = useToastStore.getState();
    expect(s.toasts).toHaveLength(1);
    expect(s.toasts.find((t) => t.id === id)).toBeUndefined();
    nowSpy.mockRestore();
  });
});

describe('clearToasts', () => {
  it('empties the toast list', () => {
    useToastStore.getState().showToast(payload);
    useToastStore.getState().showToast(payload);
    useToastStore.getState().clearToasts();
    expect(useToastStore.getState().toasts).toEqual([]);
  });
});
