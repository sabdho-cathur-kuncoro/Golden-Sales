import { db } from "./db";

/** Row status in the local sync queue. */
export type CartStatus = "synced" | "pending" | "deleted";

type CartRow = {
  raw: string;
};

type PendingRow = {
  id: string;
  qty: number;
  raw: string;
  status: CartStatus;
};

type CountRow = {
  total: number | null;
};

export const cartCache = {
  /**
   * Apply a server snapshot. Inserts new lines as 'synced' and refreshes
   * existing 'synced' lines — but NEVER overwrites rows still 'pending' or
   * 'deleted' (unpushed local changes win until the sync queue drains).
   */
  upsertFromServer: async (items: any[]) => {
    if (!Array.isArray(items) || items.length === 0) return;

    try {
      const sqlite = await db.instance();
      const now = Date.now();

      // Exclusive: serializes overlapping cart writes on the one shared
      // connection (plain withTransactionAsync lets a 2nd BEGIN fail →
      // "cannot rollback - no transaction is active").
      await sqlite.withExclusiveTransactionAsync(async (txn) => {
        for (const item of items) {
          await txn.runAsync(
            `INSERT INTO cart (id, product_id, qty, raw, status, updated_at)
             VALUES (?, ?, ?, ?, 'synced', ?)
             ON CONFLICT(id) DO UPDATE SET
               product_id = excluded.product_id,
               qty = excluded.qty,
               raw = excluded.raw,
               status = 'synced',
               updated_at = excluded.updated_at
             WHERE cart.status = 'synced';`,
            [
              String(item?.id ?? ""),
              item?.productId ?? item?.product_id ?? null,
              item?.qty ?? 1,
              JSON.stringify(item),
              now,
            ]
          );
        }
      });
    } catch (error) {
      console.error("[CartCache:upsertFromServer]", error);
    }
  },

  /** Local create/update — marks the line 'pending' for later push. */
  upsertLocal: async (item: any) => {
    const now = Date.now();
    await db.run(
      `INSERT INTO cart (id, product_id, qty, raw, status, updated_at)
       VALUES (?, ?, ?, ?, 'pending', ?)
       ON CONFLICT(id) DO UPDATE SET
         product_id = excluded.product_id,
         qty = excluded.qty,
         raw = excluded.raw,
         status = 'pending',
         updated_at = excluded.updated_at;`,
      [
        String(item?.id ?? ""),
        item?.productId ?? item?.product_id ?? null,
        item?.qty ?? 1,
        JSON.stringify(item),
        now,
      ]
    );
  },

  /** Local quantity change — marks 'pending'. */
  setQty: async (id: string, qty: number) => {
    await db.run(
      "UPDATE cart SET qty = ?, status = 'pending', updated_at = ? WHERE id = ?;",
      [qty, Date.now(), id]
    );
  },

  /**
   * Local delete. A never-synced 'pending' row is dropped outright; a row
   * that exists on the server becomes a 'deleted' tombstone so the sync
   * queue can push the DELETE later.
   */
  removeLocal: async (id: string) => {
    await db.run("DELETE FROM cart WHERE id = ? AND status = 'pending';", [id]);
    await db.run(
      "UPDATE cart SET status = 'deleted', updated_at = ? WHERE id = ?;",
      [Date.now(), id]
    );
  },

  /** Visible cart lines (tombstones hidden), newest first. */
  getAll: async (): Promise<any[]> => {
    const rows = await db.getAll<CartRow>(
      "SELECT raw FROM cart WHERE status != 'deleted' ORDER BY updated_at DESC;"
    );

    return rows
      .map((row) => {
        try {
          return JSON.parse(row.raw);
        } catch {
          return null;
        }
      })
      .filter(Boolean);
  },

  /** Sum of visible line quantities (badge count). */
  count: async (): Promise<number> => {
    const row = await db.getFirst<CountRow>(
      "SELECT SUM(qty) AS total FROM cart WHERE status != 'deleted';"
    );
    return row?.total ?? 0;
  },

  /** Rows awaiting push to the API (the sync queue). */
  getPending: async (): Promise<PendingRow[]> => {
    return db.getAll<PendingRow>(
      "SELECT id, qty, raw, status FROM cart WHERE status != 'synced';"
    );
  },

  /** Mark a pushed create/update as reconciled. */
  markSynced: async (id: string) => {
    await db.run("UPDATE cart SET status = 'synced' WHERE id = ?;", [id]);
  },

  /** Drop a tombstone after its DELETE was pushed. */
  hardRemove: async (id: string) => {
    await db.run("DELETE FROM cart WHERE id = ?;", [id]);
  },

  clear: async () => {
    await db.run("DELETE FROM cart;");
  },

  /** Blob read: all stored cart lines (alias of getAll). */
  load: async (): Promise<any[]> => cartCache.getAll(),

  /**
   * Blob write: replace the whole cart with `items` (delete-all then insert each
   * as a 'synced' row). Matches the store's whole-cart PUT model. Empty array clears.
   */
  save: async (items: any[]): Promise<void> => {
    try {
      const sqlite = await db.instance();
      const now = Date.now();

      // Exclusive: serializes overlapping cart writes on the one shared
      // connection (plain withTransactionAsync lets a 2nd BEGIN fail →
      // "cannot rollback - no transaction is active").
      await sqlite.withExclusiveTransactionAsync(async (txn) => {
        await txn.runAsync("DELETE FROM cart;");
        for (const item of items ?? []) {
          await txn.runAsync(
            `INSERT INTO cart (id, product_id, qty, raw, status, updated_at)
             VALUES (?, ?, ?, ?, 'synced', ?)
             ON CONFLICT(id) DO UPDATE SET
               product_id = excluded.product_id,
               qty = excluded.qty,
               raw = excluded.raw,
               status = 'synced',
               updated_at = excluded.updated_at;`,
            [
              String(item?.id ?? item?.productId ?? item?.product_id ?? ""),
              item?.productId ?? item?.product_id ?? null,
              item?.qty ?? item?.quantity ?? 1,
              JSON.stringify(item),
              now,
            ]
          );
        }
      });
    } catch (error) {
      console.error("[CartCache:save]", error);
    }
  },
};
