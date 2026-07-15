import { useInputModalStore } from './input.store';

beforeEach(() => useInputModalStore.setState({ visible: false, options: {} }));

describe('showInput', () => {
  it('sets visible and stores options', () => {
    const onConfirm = jest.fn();
    useInputModalStore
      .getState()
      .showInput({ title: 'T', placeholder: 'P', onConfirm });
    const s = useInputModalStore.getState();
    expect(s.visible).toBe(true);
    expect(s.options.title).toBe('T');
    expect(s.options.placeholder).toBe('P');
    expect(s.options.onConfirm).toBe(onConfirm);
  });
});

describe('hideInput', () => {
  it('resets visible and clears options', () => {
    useInputModalStore.getState().showInput({ title: 'T' });
    useInputModalStore.getState().hideInput();
    const s = useInputModalStore.getState();
    expect(s.visible).toBe(false);
    expect(s.options).toEqual({});
  });
});
