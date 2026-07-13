import { create } from "zustand";

interface NetworkState {
  // default true → no false "offline" flash before the first NetInfo event
  isConnected: boolean;
  // connected but slow/flaky, derived from API latency + timeouts
  isSlow: boolean;
  setConnected: (v: boolean) => void;
  setSlow: (v: boolean) => void;
}

export const useNetworkStore = create<NetworkState>((set, get) => ({
  isConnected: true,
  isSlow: false,
  setConnected: (v) => {
    if (get().isConnected !== v) set({ isConnected: v });
  },
  setSlow: (v) => {
    if (get().isSlow !== v) set({ isSlow: v });
  },
}));

export const selectIsConnected = (s: NetworkState) => s.isConnected;
export const selectIsSlow = (s: NetworkState) => s.isSlow;

// --- API-latency quality sampler --------------------------------------------
// A request is "bad" when it's slow or times out. Keep a small rolling window
// of the most recent samples; flag the connection unstable when enough of them
// are bad, and recover as fast samples push the bad ones out. Kept module-level
// (not reactive state) so sampling never triggers re-renders.
export const SLOW_REQUEST_MS = 10000;
const WINDOW = 5;
const BAD_THRESHOLD = 2;
const samples: boolean[] = [];

/** Feed one completed request's outcome (bad = slow or timed out). */
export function reportLatencySample(bad: boolean): void {
  samples.push(bad);
  if (samples.length > WINDOW) samples.shift();
  const badCount = samples.filter(Boolean).length;
  useNetworkStore.getState().setSlow(badCount >= BAD_THRESHOLD);
}

/** Drop the window (e.g. when the device goes fully offline). */
export function resetLatencySamples(): void {
  samples.length = 0;
  useNetworkStore.getState().setSlow(false);
}
