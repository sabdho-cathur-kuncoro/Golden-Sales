// jest-expo defaults Platform.OS to 'ios'. Assert the exported flags match the
// current env, then re-derive them under a forced 'android' OS via an isolated
// module registry (jest.doMock + resetModules) to cover the other branch.
import { isAndroid, isIOS } from './platform';

describe('platform flags (default jest-expo env → ios)', () => {
  it('isIOS is true, isAndroid is false', () => {
    expect(isIOS).toBe(true);
    expect(isAndroid).toBe(false);
  });
  it('the two flags are mutually exclusive', () => {
    expect(isIOS).not.toBe(isAndroid);
  });
});

describe('platform flags under forced android OS', () => {
  afterEach(() => {
    jest.resetModules();
    jest.dontMock('react-native');
  });

  it('isAndroid is true, isIOS is false', () => {
    jest.resetModules();
    jest.doMock('react-native', () => ({ Platform: { OS: 'android' } }));
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('./platform');
    expect(mod.isAndroid).toBe(true);
    expect(mod.isIOS).toBe(false);
  });
});
