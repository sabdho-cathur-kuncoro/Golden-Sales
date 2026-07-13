import { useNotificationStore } from "@/stores/notification.store";
import { router } from "expo-router";
import { dismissTray } from "./tray";

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

type RouteTarget =
  | string
  | { pathname: string; params: Record<string, string> };

/**
 * Map a server resource segment to its in-app Expo Router screen + id param.
 * The backend path (e.g. `/sales/orders/29`) names the RESOURCE (`orders`),
 * not the app screen — translate it here. Add an entry per new deep-link type.
 */
const RESOURCE_ROUTES: Record<string, { pathname: string; param: string }> = {
  orders: { pathname: "/transaksi-detail", param: "id" },
};

// App routes whose id is a query param, not a path segment. The backend may
// send the route already app-shaped (e.g. `/transaksi-detail`) with the id only
// in `orderId` — attach it as `?id=`. Extend as more query-param routes appear.
const QUERY_PARAM_ROUTES: Record<string, string> = {
  "transaksi-detail": "id",
};

// Pull the id for a query-param route out of "?id=29" / "?foo=1&id=29".
function queryParam(query: string | undefined, key: string): string | undefined {
  if (!query) return undefined;
  for (const pair of query.split("&")) {
    const [k, v] = pair.split("=");
    if (k === key && v) return decodeURIComponent(v);
  }
  return undefined;
}

/**
 * Resolve the in-app Expo Router target from a notification payload, driven by
 * the payload's own path string: FCM `data.route` or the API row's `link`
 * (e.g. `/sales/orders/29`). Walks the path for a known resource segment and
 * maps it to the app screen, taking the id from the next segment (or `?id=`,
 * or the notif's `orderId`). Unknown paths pass through as-is; returns
 * undefined only when there's no usable path.
 */
export function resolveNotifRoute(
  data?: Record<string, any> | null
): RouteTarget | undefined {
  const link = deepLinkFromData(data); // data.route ?? data.link, must start "/"
  if (!link) return undefined;

  const [path, query] = link.split("?");
  const segments = path.slice(1).split("/").filter(Boolean); // ["sales","orders","29"] or ["transaksi-detail"]
  const orderId = data?.orderId ?? data?.order_id;

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];

    // server resource (e.g. `orders`) → app screen. `orderId` is the source of
    // truth for the id; fall back to the path segment / query only if absent.
    const resource = RESOURCE_ROUTES[seg];
    if (resource) {
      const id =
        orderId ?? segments[i + 1] ?? queryParam(query, resource.param);
      if (id != null && String(id) !== "") {
        return {
          pathname: resource.pathname,
          params: { [resource.param]: String(id) },
        };
      }
      return resource.pathname;
    }

    // app route that needs its id as a query param (e.g. `/transaksi-detail`)
    const paramKey = QUERY_PARAM_ROUTES[seg];
    if (paramKey) {
      const id = orderId ?? queryParam(query, paramKey) ?? segments[i + 1];
      if (id != null && String(id) !== "") {
        return { pathname: `/${seg}`, params: { [paramKey]: String(id) } };
      }
    }
  }

  return link; // unknown route → honor the payload path as-is
}

/**
 * Runs when the user opens the app by tapping a notification (req #2, #4).
 * Body-tap only — no in-tray action buttons.
 *
 * - clears the tapped notification (or all) from the tray
 * - resets the app icon badge
 * - refreshes the in-app unread count so the header bell stays in sync
 * - navigates to the resolved in-app route (server `route` is mapped, not raw)
 */
export async function handleNotificationOpen(
  data: Record<string, string> | undefined
): Promise<void> {
  // clear the tapped tray entry (or all) + reset badge; never throws
  await dismissTray(data?.notifId);

  // keep header bell badge honest
  useNotificationStore.getState().refetch();

  const target = resolveNotifRoute(data);
  if (target) {
    router.push(target as any);
  }
}

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
