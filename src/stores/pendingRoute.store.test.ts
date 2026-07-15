import { usePendingRouteStore } from './pendingRoute.store';

beforeEach(() => usePendingRouteStore.setState({ route: null }));

describe('set', () => {
  it('stashes a route', () => {
    usePendingRouteStore.getState().set('/order/1');
    expect(usePendingRouteStore.getState().route).toBe('/order/1');
  });
});

describe('consume', () => {
  it('returns and clears the stashed route', () => {
    usePendingRouteStore.getState().set('/order/1');
    const r = usePendingRouteStore.getState().consume();
    expect(r).toBe('/order/1');
    expect(usePendingRouteStore.getState().route).toBeNull();
  });

  it('returns null and leaves state untouched when empty', () => {
    const r = usePendingRouteStore.getState().consume();
    expect(r).toBeNull();
    expect(usePendingRouteStore.getState().route).toBeNull();
  });
});
