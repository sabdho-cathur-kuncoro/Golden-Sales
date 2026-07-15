import { useConfirmStore } from './confirm.store';

beforeEach(() => useConfirmStore.setState({ visible: false, options: {} }));

describe('show', () => {
  it('sets visible and stores options', () => {
    const onConfirm = jest.fn();
    useConfirmStore
      .getState()
      .show({ title: 'T', message: 'M', type: 'danger', onConfirm });
    const s = useConfirmStore.getState();
    expect(s.visible).toBe(true);
    expect(s.options.title).toBe('T');
    expect(s.options.message).toBe('M');
    expect(s.options.type).toBe('danger');
    expect(s.options.onConfirm).toBe(onConfirm);
  });
});

describe('hide', () => {
  it('resets visible and clears options', () => {
    useConfirmStore.getState().show({ title: 'T', onConfirm: jest.fn() });
    useConfirmStore.getState().hide();
    const s = useConfirmStore.getState();
    expect(s.visible).toBe(false);
    expect(s.options).toEqual({});
  });
});
