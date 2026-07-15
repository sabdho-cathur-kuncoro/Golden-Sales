import { usePrePermissionModal } from './prePermission.store';

beforeEach(() =>
  usePrePermissionModal.setState({ visible: false, options: undefined })
);

const baseOpts = {
  title: 'T',
  description: 'D',
  onConfirm: jest.fn(),
  onCancel: jest.fn(),
};

describe('show', () => {
  it('sets visible and stores options', () => {
    usePrePermissionModal.getState().show(baseOpts);
    const s = usePrePermissionModal.getState();
    expect(s.visible).toBe(true);
    expect(s.options).toBe(baseOpts);
  });
});

describe('hide', () => {
  it('resets visible and clears options', () => {
    usePrePermissionModal.getState().show(baseOpts);
    usePrePermissionModal.getState().hide();
    const s = usePrePermissionModal.getState();
    expect(s.visible).toBe(false);
    expect(s.options).toBeUndefined();
  });
});
