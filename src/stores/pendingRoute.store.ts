import { create } from "zustand";

/**
 * Cold-start deep-link handoff for push notifications.
 *
 * When the app is launched from a killed state by tapping a notification, the
 * router is not mounted yet, so the target route cannot be pushed immediately.
 * The notification tap handler (`notifee.onBackgroundEvent` in `index.js`, or
 * FCM `getInitialNotification`) stashes the route here; the bootstrap screen
 * (`src/app/index.tsx`) `consume()`s it once the router is ready.
 */
type PendingRouteState = {
  route: string | null;
  /** Stash a route to be navigated to once the router is mounted. */
  set: (route: string | null) => void;
  /** Read and clear the pending route (returns null if none). */
  consume: () => string | null;
};

export const usePendingRouteStore = create<PendingRouteState>((set, get) => ({
  route: null,
  set: (route) => set({ route }),
  consume: () => {
    const r = get().route;
    if (r) set({ route: null });
    return r;
  },
}));
