import {
  useNetworkStore,
  selectIsConnected,
  selectIsSlow,
  reportLatencySample,
  resetLatencySamples,
} from './network.store';

beforeEach(() => {
  resetLatencySamples();
  useNetworkStore.setState({ isConnected: true, isSlow: false });
});

describe('setters (only change on difference)', () => {
  it('setConnected / setSlow update state', () => {
    useNetworkStore.getState().setConnected(false);
    expect(selectIsConnected(useNetworkStore.getState())).toBe(false);
    useNetworkStore.getState().setSlow(true);
    expect(selectIsSlow(useNetworkStore.getState())).toBe(true);
  });
});

describe('reportLatencySample rolling window (WINDOW=5, threshold=2)', () => {
  it('flags slow once 2 of the recent samples are bad', () => {
    reportLatencySample(true);
    expect(useNetworkStore.getState().isSlow).toBe(false); // 1 bad
    reportLatencySample(true);
    expect(useNetworkStore.getState().isSlow).toBe(true); // 2 bad
  });

  it('recovers as good samples push bad ones out of the 5-wide window', () => {
    reportLatencySample(true);
    reportLatencySample(true);
    expect(useNetworkStore.getState().isSlow).toBe(true);
    // window currently [t,t]; push 5 good → window becomes [g,g,g,g,g]
    for (let i = 0; i < 5; i++) reportLatencySample(false);
    expect(useNetworkStore.getState().isSlow).toBe(false);
  });

  it('resetLatencySamples clears window and slow flag', () => {
    reportLatencySample(true);
    reportLatencySample(true);
    resetLatencySamples();
    expect(useNetworkStore.getState().isSlow).toBe(false);
    reportLatencySample(true);
    expect(useNetworkStore.getState().isSlow).toBe(false); // window was cleared
  });
});
