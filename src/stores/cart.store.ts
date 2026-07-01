import {
  getCartsService,
  onDeleteCartService,
  onUpdateCartService,
} from "@/services/cart.services";
import { cartCache } from "@/storage/cart.cache";
import { useAuthStore } from "@/stores/auth.store";
import { create } from "zustand";
import { lineWithPromo } from "../../utils/promo";

/**
 * Cart state + sync, mirroring the web `CartContext` flow adapted to RN:
 * in-memory `items`, persisted to one local blob (cartCache), debounced full-cart
 * PUT to the blob endpoint. Backed by Zustand so all screens share one cart
 * (the RN-idiomatic stand-in for a Context Provider). Consume via `useCart`.
 */

type CartState = {
  items: any[];
  hydrated: boolean;
  /** Locked warehouse for the current order — 1 order = 1 warehouse. */
  warehouse: any | null;
  hydrate: () => Promise<void>;
  /** Re-pull DB blob (instant paint) then server (authoritative). Always runs. */
  refresh: () => Promise<void>;
  /** Apply an updater to items, persist locally, and schedule a server push. */
  setItems: (updater: (prev: any[]) => any[]) => void;
  /** Upsert a non-serial line keyed by product id; qty <= 0 removes it. */
  setQty: (product: any, qty: number) => void;
  /** Upsert a serial line keyed by product id; empty serials removes it. */
  addSerial: (product: any, serials: any[]) => void;
  /** Reset items and fire-and-forget the server clear. */
  clear: (id: string) => void;
  /** Remove a whole line by product id. */
  remove: (productId: any) => void;
  /** Remove one serial from a line; empties the line when its last serial goes. */
  removeSerial: (productId: any, sn: any) => void;
  /** Wipe items + reset warehouse (next order may switch gudang). */
  clearAll: () => void;
  /**
   * Set the order's warehouse. Switching to a different warehouse with a
   * non-empty cart empties it first (stock is warehouse-specific).
   */
  setWarehouse: (wh: any) => void;
  /** Wipe local cart only (memory + blob), keep the server cart. Used on logout. */
  clearLocal: () => void;
};

/** Selected warehouse — use as a zustand selector for the chip. */
export const selectWarehouse = (s: CartState): any | null => s.warehouse;

/** Units in a single line: serial lines count by SN count, others by quantity. */
export const lineUnits = (i: any): number =>
  i?.serials?.length ? i.serials.length : Number(i?.quantity) || 0;

/** Total cart units — use as a zustand selector for the badge count. */
export const selectCartCount = (s: CartState): number =>
  s.items.reduce((n, i) => n + lineUnits(i), 0);

/** Promo-aware line math for one cart line ({ promo, discountPerUnit, subtotal, label }). */
export const lineInfo = (i: any) =>
  lineWithPromo(Number(i?.salesPrice) || 0, lineUnits(i), i?.promos);

/** Gross subtotal (before promo) across all lines. */
export const selectSubtotal = (s: CartState): number =>
  s.items.reduce((n, i) => n + (Number(i?.salesPrice) || 0) * lineUnits(i), 0);

/** Total product-promo discount across all lines. */
export const selectPromoTotal = (s: CartState): number =>
  s.items.reduce((n, i) => n + lineInfo(i).discountPerUnit * lineUnits(i), 0);

/** Net subtotal (subtotal − promo) across all lines. */
export const selectNetSubtotal = (s: CartState): number =>
  s.items.reduce((n, i) => n + lineInfo(i).subtotal, 0);

/**
 * Build a cart line. Shape follows `orders.services` submit (`productId`,
 * `quantity`, `serials`) plus display fields used by the cart UI.
 */
const buildLine = (product: any, quantity: number, serials: any[]) => ({
  productId: product?.id,
  productName: product?.productName,
  productCode: product?.productCode,
  salesPrice: product?.salesPrice ?? 0,
  imageBase64: product?.imageBase64,
  imageContentType: product?.imageContentType,
  promos: product?.promos ?? [],
  quantity,
  serials,
});

// Module-scope sync bookkeeping (outside React, like the snippet's refs).
let saveTimer: ReturnType<typeof setTimeout> | null = null;
let lastSavedJson: string | null = null;
let hydrating = false;

const customerId = () => useAuthStore.getState().user?.id ?? null;

export const useCartStore = create<CartState>((set, get) => {
  /** Debounced full-cart push (500ms), skipping no-ops. */
  const scheduleSync = () => {
    if (!get().hydrated || !customerId()) return;

    const currentJson = JSON.stringify(get().items);
    if (currentJson === lastSavedJson) return;

    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      onUpdateCartService(currentJson)
        .then(() => {
          lastSavedJson = currentJson;
        })
        .catch(() => {
          // offline → local blob still holds the change; retry on next mutate
        });
    }, 500);
  };

  return {
    items: [],
    hydrated: false,
    warehouse: null,

    hydrate: async () => {
      if (hydrating || get().hydrated) return;
      await get().refresh();
      set({ hydrated: true });
    },

    refresh: async () => {
      // Guard concurrent runs (bootstrap hydrate + focus/pull both call this).
      if (hydrating) return;
      hydrating = true;
      try {
        // Local blob first for instant paint.
        const local = await cartCache.load();
        if (local.length) set({ items: local });

        if (customerId()) {
          try {
            const data = await getCartsService();
            // Server shape unconfirmed: accept a bare array, or `{ items }`
            // where items is a JSON-string blob or an array.
            const raw = data?.items ?? data;
            const serverItems =
              typeof raw === "string" ? JSON.parse(raw || "[]") : raw;
            if (Array.isArray(serverItems)) {
              set({ items: serverItems });
              lastSavedJson = JSON.stringify(serverItems);
              await cartCache.save(serverItems);
            }
          } catch {
            // server down / offline — keep the local blob
          }
        }
      } finally {
        hydrating = false;
      }
    },

    setItems: (updater) => {
      const next = updater(get().items);
      set({ items: next });
      cartCache.save(next).catch(() => {});
      scheduleSync();
    },

    setQty: (product, qty) => {
      get().setItems((prev) => {
        const others = prev.filter((i) => i?.productId !== product?.id);
        if (!qty || qty <= 0) return others;
        return [...others, buildLine(product, qty, [])];
      });
    },

    addSerial: (product, serials) => {
      get().setItems((prev) => {
        const others = prev.filter((i) => i?.productId !== product?.id);
        if (!Array.isArray(serials) || serials.length === 0) return others;
        return [...others, buildLine(product, serials.length, serials)];
      });
    },

    clear: (id: string) => {
      set({ items: [] });
      cartCache.clear().catch(() => {});
      if (saveTimer) clearTimeout(saveTimer);
      if (customerId()) {
        onDeleteCartService(id).catch(() => {});
        lastSavedJson = "[]";
      }
    },

    remove: (productId) => {
      get().setItems((prev) => prev.filter((i) => i?.productId !== productId));
    },

    removeSerial: (productId, sn) => {
      get().setItems((prev) =>
        prev
          .map((i) => {
            if (i?.productId !== productId) return i;
            const serials = (i?.serials ?? []).filter((s: any) => s !== sn);
            return { ...i, serials, quantity: serials.length };
          })
          .filter((i) => !(i?.productId === productId && i?.serials?.length === 0))
      );
    },

    clearAll: () => {
      const current = get().warehouse;
      set({ items: [], warehouse: null });
      cartCache.clear().catch(() => {});
      if (saveTimer) clearTimeout(saveTimer);
      if (customerId()) {
        onDeleteCartService(String(current?.id ?? "")).catch(() => {});
        lastSavedJson = "[]";
      }
    },

    setWarehouse: (wh: any) => {
      const current = get().warehouse;
      // Switching warehouse with items in the cart empties it (stock differs
      // per warehouse) — reuse the same clear path as `clear()`.
      if (current?.id !== wh?.id && get().items.length > 0) {
        set({ items: [] });
        cartCache.clear().catch(() => {});
        if (saveTimer) clearTimeout(saveTimer);
        if (customerId()) {
          onDeleteCartService(String(current?.id ?? "")).catch(() => {});
          lastSavedJson = "[]";
        }
      }
      set({ warehouse: wh });
    },

    clearLocal: () => {
      // Cancel any pending debounced PUT so it can't fire after logout.
      if (saveTimer) clearTimeout(saveTimer);
      // Reset hydrated so a re-login re-pulls the new user's server cart.
      set({ items: [], hydrated: false, warehouse: null });
      cartCache.clear().catch(() => {});
      lastSavedJson = null;
    },
  };
});
