import { useLoadingStore } from './loading.store';

const reset = () =>
  useLoadingStore.setState({
    visible: false,
    message: undefined,
    startedAt: null,
    minDuration: 800,
    cancellable: false,
    onCancel: undefined,
  });

beforeEach(() => {
  jest.useFakeTimers();
  reset();
});

afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
});

describe('showLoading', () => {
  it('opens with message/cancellable and records startedAt', () => {
    const t0 = Date.now();
    const onCancel = jest.fn();
    useLoadingStore
      .getState()
      .showLoading({ message: 'Wait', cancellable: true, onCancel });
    const s = useLoadingStore.getState();
    expect(s.visible).toBe(true);
    expect(s.message).toBe('Wait');
    expect(s.cancellable).toBe(true);
    expect(s.onCancel).toBe(onCancel);
    expect(s.startedAt).toBeGreaterThanOrEqual(t0);
  });

  it('defaults cancellable to false when omitted', () => {
    useLoadingStore.getState().showLoading();
    expect(useLoadingStore.getState().cancellable).toBe(false);
  });

  it('while already visible updates message but keeps startedAt', () => {
    useLoadingStore.getState().showLoading({ message: 'First' });
    const startedAt = useLoadingStore.getState().startedAt;
    useLoadingStore.getState().showLoading({ message: 'Second' });
    const s = useLoadingStore.getState();
    expect(s.message).toBe('Second');
    expect(s.startedAt).toBe(startedAt);
  });
});

describe('hideLoading (minDuration floor)', () => {
  it('hides immediately once minDuration has elapsed', () => {
    useLoadingStore.getState().showLoading({ message: 'Wait' });
    jest.advanceTimersByTime(800); // >= minDuration
    useLoadingStore.getState().hideLoading();
    const s = useLoadingStore.getState();
    expect(s.visible).toBe(false);
    expect(s.message).toBeUndefined();
    expect(s.startedAt).toBeNull();
  });

  it('defers hide until the remaining minDuration passes', () => {
    useLoadingStore.getState().showLoading({ message: 'Wait' });
    jest.advanceTimersByTime(300); // 500ms remain
    useLoadingStore.getState().hideLoading();
    expect(useLoadingStore.getState().visible).toBe(true); // still floored
    jest.advanceTimersByTime(500);
    expect(useLoadingStore.getState().visible).toBe(false);
  });
});

describe('cancelLoading', () => {
  it('invokes onCancel and hides', () => {
    const onCancel = jest.fn();
    useLoadingStore.getState().showLoading({ cancellable: true, onCancel });
    jest.advanceTimersByTime(800);
    useLoadingStore.getState().cancelLoading();
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(useLoadingStore.getState().visible).toBe(false);
  });
});
