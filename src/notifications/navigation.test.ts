// navigation.ts imports the notification store, expo-router, and ./tray
// (→ @notifee) at module scope. The pure resolvers under test use none of them,
// so stub each to keep the import graph off native modules.
jest.mock('@/stores/notification.store', () => ({ useNotificationStore: { getState: () => ({ refetch: jest.fn() }) } }));
jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));
jest.mock('@notifee/react-native', () => ({ __esModule: true, default: {} }));

import { deepLinkFromData, resolveNotifRoute, resolveNotifTarget } from './navigation';

describe('deepLinkFromData', () => {
  it('accepts route or link starting with "/"', () => {
    expect(deepLinkFromData({ route: '/a' })).toBe('/a');
    expect(deepLinkFromData({ link: '/b' })).toBe('/b');
    expect(deepLinkFromData({ route: '/a', link: '/b' })).toBe('/a'); // route wins
  });
  it('undefined for missing/non-string/relative', () => {
    expect(deepLinkFromData(null)).toBeUndefined();
    expect(deepLinkFromData({ route: 'no-slash' })).toBeUndefined();
    expect(deepLinkFromData({ route: 123 as any })).toBeUndefined();
  });
});

describe('resolveNotifRoute', () => {
  it('undefined when no usable path', () => {
    expect(resolveNotifRoute({})).toBeUndefined();
  });
  it('maps server resource segment → app screen with id from path', () => {
    expect(resolveNotifRoute({ route: '/sales/orders/29' })).toEqual({
      pathname: '/transaksi-detail',
      params: { id: '29' },
    });
  });
  it('orderId is the source of truth for the id', () => {
    expect(resolveNotifRoute({ route: '/sales/orders/29', orderId: '77' })).toEqual({
      pathname: '/transaksi-detail',
      params: { id: '77' },
    });
    expect(resolveNotifRoute({ route: '/sales/orders/29', order_id: 88 })).toEqual({
      pathname: '/transaksi-detail',
      params: { id: '88' },
    });
  });
  it('resource with no id → bare pathname', () => {
    expect(resolveNotifRoute({ route: '/sales/orders' })).toBe('/transaksi-detail');
  });
  it('query-param route takes id from orderId or ?id=', () => {
    expect(resolveNotifRoute({ route: '/transaksi-detail?id=5' })).toEqual({
      pathname: '/transaksi-detail',
      params: { id: '5' },
    });
    expect(resolveNotifRoute({ route: '/transaksi-detail', orderId: 9 })).toEqual({
      pathname: '/transaksi-detail',
      params: { id: '9' },
    });
  });
  it('unknown route passes through as-is', () => {
    expect(resolveNotifRoute({ route: '/home' })).toBe('/home');
  });
});

describe('resolveNotifTarget', () => {
  it('fallback route for invalid link', () => {
    expect(resolveNotifTarget(null)).toBe('/notif');
    expect(resolveNotifTarget('no-slash')).toBe('/notif');
  });
  it('query-param route prefers idOverride', () => {
    expect(resolveNotifTarget('/transaksi-detail/5', 9)).toEqual({
      pathname: '/transaksi-detail',
      params: { id: '9' },
    });
  });
  it('query-param route falls back to path id when no override', () => {
    expect(resolveNotifTarget('/transaksi-detail/5')).toEqual({
      pathname: '/transaksi-detail',
      params: { id: '5' },
    });
  });
  it('plain / dynamic paths pass through', () => {
    expect(resolveNotifTarget('/home')).toBe('/home');
  });
});
