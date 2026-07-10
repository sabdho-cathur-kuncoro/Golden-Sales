import { useNotificationStore } from "@/stores/notification.store";
import notifee from "@notifee/react-native";
import { router } from "expo-router";

const FALLBACK_ROUTE = "/notif";

/**
 * Deep-link path from an FCM data payload. The backend sends it as `route` or
 * `link` (the in-app notif list uses `link`); accept either. Returns undefined
 * when absent/invalid so callers can fall back.
 */
export function deepLinkFromData(
  data?: Record<string, any> | null
): string | undefined {
  const raw = data?.route ?? data?.link;
  return typeof raw === "string" && raw.startsWith("/") ? raw : undefined;
}

/**
 * Runs when the user opens the app by tapping a notification (req #2, #4).
 * Body-tap only — no in-tray action buttons.
 *
 * - clears the tapped notification (or all) from the tray
 * - resets the app icon badge
 * - refreshes the in-app unread count so the header bell stays in sync
 * - navigates to the deep-link route the backend put in `data.route`
 */
export async function handleNotificationOpen(
  data: Record<string, string> | undefined
): Promise<void> {
  try {
    if (data?.notifId) {
      await notifee.cancelNotification(data.notifId);
    } else {
      await notifee.cancelAllNotifications();
    }
    await notifee.setBadgeCount(0);
  } catch {
    // display cleanup must never block navigation
  }

  // keep header bell badge honest
  useNotificationStore.getState().refetch();

  const route = data?.route;
  if (route) {
    // e.g. "/approval-detail?id=123"
    router.push(route as any);
  }
}

type RouteTarget =
  | string
  | { pathname: string; params: Record<string, string> };

// Static routes that take their id as a query param instead of a [id] segment.
// Extend this map if more query-param routes get notif links.
const QUERY_PARAM_ROUTES: Record<string, string> = {
  "transaksi-detail": "id",
};

/**
 * Convert a server path-link into an Expo Router target.
 *
 * For query-param routes (e.g. `detail-laporan`), `idOverride` (the notif's
 * `orderId`) is preferred as the id; the trailing path segment is the fallback
 * used by the push path, which only carries a route string.
 */
export function resolveNotifTarget(
  link?: string | null,
  idOverride?: string | number | null
): RouteTarget {
  if (typeof link !== "string" || !link.startsWith("/")) return FALLBACK_ROUTE;
  const [base, id, ...rest] = link.slice(1).split("/");
  const paramKey = QUERY_PARAM_ROUTES[base];
  if (paramKey && rest.length === 0) {
    const value = idOverride != null ? String(idOverride) : id;
    if (value) return { pathname: `/${base}`, params: { [paramKey]: value } };
  }
  return link; // dynamic routes + plain paths pass through
}
