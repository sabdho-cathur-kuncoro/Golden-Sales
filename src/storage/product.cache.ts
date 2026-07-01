import { db } from "./db";

type ProductRow = {
  raw: string;
};

type UpdatedAtRow = {
  updated_at: number | null;
};

// Cache scope: "all" = global Katalog list, or a warehouseId string for the
// per-warehouse Order list. Keeps the two from overwriting each other's rows.
const DEFAULT_SCOPE = "all";

export const productsCache = {
  /** Replace/refresh cached products for a scope in a single transaction. */
  upsertMany: async (products: any[], scope: string = DEFAULT_SCOPE) => {
    if (!Array.isArray(products) || products.length === 0) return;

    try {
      const sqlite = await db.instance();
      const now = Date.now();

      // Exclusive: serializes overlapping writes (mount fetch + pull-refresh +
      // catalog all trigger upsertMany on the one shared connection). Plain
      // withTransactionAsync lets a 2nd BEGIN fail → "cannot rollback".
      await sqlite.withExclusiveTransactionAsync(async (txn) => {
        for (const product of products) {
          await txn.runAsync(
            `INSERT INTO product_cache (id, scope, name, price, raw, updated_at)
             VALUES (?, ?, ?, ?, ?, ?)
             ON CONFLICT(id, scope) DO UPDATE SET
               name = excluded.name,
               price = excluded.price,
               raw = excluded.raw,
               updated_at = excluded.updated_at;`,
            [
              String(product?.id ?? ""),
              scope,
              product?.name ?? null,
              product?.price ?? null,
              JSON.stringify(product),
              now,
            ]
          );
        }
      });
    } catch (error) {
      console.error("[ProductsCache:upsertMany]", error);
    }
  },

  /** Return cached products for a scope as their original API objects. */
  getAll: async (scope: string = DEFAULT_SCOPE): Promise<any[]> => {
    const rows = await db.getAll<ProductRow>(
      "SELECT raw FROM product_cache WHERE scope = ? ORDER BY updated_at DESC;",
      [scope]
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

  /** Newest cache timestamp (ms) for a scope, for staleness checks. */
  getUpdatedAt: async (scope: string = DEFAULT_SCOPE): Promise<number | null> => {
    const row = await db.getFirst<UpdatedAtRow>(
      "SELECT MAX(updated_at) AS updated_at FROM product_cache WHERE scope = ?;",
      [scope]
    );

    return row?.updated_at ?? null;
  },

  /** Clear one scope, or the whole cache when no scope is given. */
  clear: async (scope?: string) => {
    if (scope) {
      await db.run("DELETE FROM product_cache WHERE scope = ?;", [scope]);
    } else {
      await db.run("DELETE FROM product_cache;");
    }
  },
};
