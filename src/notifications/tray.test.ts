// tray.ts imports @notifee/react-native at module scope; resolveTrayId itself
// touches none of it. Stub the module so the import resolves under jest.
jest.mock('@notifee/react-native', () => ({ __esModule: true, default: {} }));

import { resolveTrayId } from './tray';

describe('resolveTrayId', () => {
  it('prefers backend notifId', () => {
    expect(resolveTrayId({ data: { notifId: 'n1' }, messageId: 'm1' } as any)).toBe('n1');
  });
  it('falls back to FCM messageId', () => {
    expect(resolveTrayId({ data: {}, messageId: 'm1' } as any)).toBe('m1');
  });
  it('undefined when neither present', () => {
    expect(resolveTrayId({ data: {} } as any)).toBeUndefined();
    expect(resolveTrayId({} as any)).toBeUndefined();
  });
});
