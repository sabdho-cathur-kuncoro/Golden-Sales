import { useGlobalStore } from './global.store';

beforeEach(() => useGlobalStore.setState({ selectedAddress: null }));

describe('setAddress', () => {
  it('stores the selected address', () => {
    const addr = { id: 1, label: 'Home' };
    useGlobalStore.getState().setAddress(addr);
    expect(useGlobalStore.getState().selectedAddress).toBe(addr);
  });

  it('can clear the address back to null', () => {
    useGlobalStore.getState().setAddress({ id: 1 });
    useGlobalStore.getState().setAddress(null);
    expect(useGlobalStore.getState().selectedAddress).toBeNull();
  });
});
