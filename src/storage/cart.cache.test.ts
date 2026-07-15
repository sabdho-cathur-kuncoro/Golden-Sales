// Mock the sqlite db singleton. Inline jest.fn()s in the factory, then import
// the mocked module and cast so assertions target the exact instances called.
jest.mock("./db", () => ({
  db: {
    init: jest.fn(),
    exec: jest.fn(),
    run: jest.fn(),
    getAll: jest.fn(),
    getFirst: jest.fn(),
    instance: jest.fn(),
  },
}));

import { cartCache } from "./cart.cache";
import { db } from "./db";

const run = db.run as jest.Mock;
const getAll = db.getAll as jest.Mock;
const getFirst = db.getFirst as jest.Mock;
const instance = db.instance as jest.Mock;

// A fake transaction whose withExclusiveTransactionAsync(cb) invokes cb(txn).
const makeTxn = () => ({
  runAsync: jest.fn().mockResolvedValue(undefined),
  execAsync: jest.fn().mockResolvedValue(undefined),
});

let txn: ReturnType<typeof makeTxn>;

// Grab the SQL+params of the db.run call whose SQL contains `fragment`.
const runCallWith = (fragment: string) =>
  run.mock.calls.find(([sql]) => sql.includes(fragment));

beforeEach(() => {
  run.mockReset().mockResolvedValue(null);
  getAll.mockReset().mockResolvedValue([]);
  getFirst.mockReset().mockResolvedValue(null);
  txn = makeTxn();
  instance.mockReset().mockResolvedValue({
    withExclusiveTransactionAsync: async (cb: (t: typeof txn) => Promise<void>) =>
      cb(txn),
  });
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  (console.error as jest.Mock).mockRestore?.();
});

describe("upsertFromServer (server snapshot; never clobbers local edits)", () => {
  it("no-ops for empty / non-array input (no transaction)", async () => {
    await cartCache.upsertFromServer([]);
    await cartCache.upsertFromServer(null as any);
    expect(instance).not.toHaveBeenCalled();
  });

  it("inserts each item as 'synced' and guards the UPDATE with status='synced'", async () => {
    await cartCache.upsertFromServer([
      { id: 1, productId: 10, qty: 2 },
      { id: 2, product_id: 20, qty: 3 },
    ]);
    expect(txn.execAsync).toHaveBeenCalledWith("PRAGMA busy_timeout = 5000;");
    expect(txn.runAsync).toHaveBeenCalledTimes(2);
    const [sql, params] = txn.runAsync.mock.calls[0];
    expect(sql).toContain("VALUES (?, ?, ?, ?, 'synced', ?)");
    // The ON CONFLICT UPDATE only fires for already-synced rows -> pending /
    // deleted tombstones survive the snapshot.
    expect(sql).toContain("WHERE cart.status = 'synced'");
    expect(params[0]).toBe("1"); // id coerced to string
    expect(params[1]).toBe(10); // productId
    expect(params[2]).toBe(2); // qty
    expect(JSON.parse(params[3])).toEqual({ id: 1, productId: 10, qty: 2 });
    // second row reads snake_case product_id
    expect(txn.runAsync.mock.calls[1][1][1]).toBe(20);
  });

  it("defaults missing qty to 1 and missing product id to null", async () => {
    await cartCache.upsertFromServer([{ id: 5 }]);
    const [, params] = txn.runAsync.mock.calls[0];
    expect(params[1]).toBeNull();
    expect(params[2]).toBe(1);
  });

  it("swallows transaction errors", async () => {
    instance.mockResolvedValueOnce({
      withExclusiveTransactionAsync: async () => {
        throw new Error("locked");
      },
    });
    await expect(
      cartCache.upsertFromServer([{ id: 1 }])
    ).resolves.toBeUndefined();
    expect(console.error).toHaveBeenCalled();
  });
});

describe("upsertLocal (marks row 'pending')", () => {
  it("inserts with pending status and the item's fields", async () => {
    await cartCache.upsertLocal({ id: 3, product_id: 30, qty: 4, foo: "bar" });
    const [sql, params] = run.mock.calls[0];
    expect(sql).toContain("INSERT INTO cart");
    expect(sql).toContain("VALUES (?, ?, ?, ?, 'pending', ?)");
    expect(sql).toContain("status = 'pending'"); // the ON CONFLICT branch too
    expect(params[0]).toBe("3");
    expect(params[1]).toBe(30);
    expect(params[2]).toBe(4);
    expect(JSON.parse(params[3])).toMatchObject({ id: 3, foo: "bar" });
  });
});

describe("setQty (marks row 'pending')", () => {
  it("updates qty + flips status to pending for the id", async () => {
    await cartCache.setQty("9", 7);
    const [sql, params] = run.mock.calls[0];
    expect(sql).toBe(
      "UPDATE cart SET qty = ?, status = 'pending', updated_at = ? WHERE id = ?;"
    );
    expect(params[0]).toBe(7);
    expect(params[2]).toBe("9");
  });
});

describe("removeLocal (pending row dropped; synced row tombstoned)", () => {
  it("issues a DELETE for pending rows AND an UPDATE-to-deleted tombstone", async () => {
    await cartCache.removeLocal("42");

    const del = runCallWith("DELETE FROM cart WHERE id = ? AND status = 'pending'");
    expect(del).toBeDefined();
    expect(del![1]).toEqual(["42"]);

    const tomb = runCallWith("SET status = 'deleted'");
    expect(tomb).toBeDefined();
    expect(tomb![1][1]).toBe("42"); // params: [now, id]
    // A never-synced pending row is removed by the DELETE (0 rows left to
    // tombstone); a server-backed row survives the DELETE and becomes 'deleted'.
    expect(run).toHaveBeenCalledTimes(2);
  });
});

describe("getAll / load (tombstones hidden, raw parsed, newest first)", () => {
  it("selects visible rows ordered newest-first and JSON-parses raw", async () => {
    getAll.mockResolvedValueOnce([
      { raw: JSON.stringify({ id: 1 }) },
      { raw: JSON.stringify({ id: 2 }) },
    ]);
    const result = await cartCache.getAll();
    const [sql] = getAll.mock.calls[0];
    expect(sql).toContain("WHERE status != 'deleted'");
    expect(sql).toContain("ORDER BY updated_at DESC");
    expect(result).toEqual([{ id: 1 }, { id: 2 }]);
  });

  it("drops rows with unparseable raw", async () => {
    getAll.mockResolvedValueOnce([
      { raw: "broken{" },
      { raw: JSON.stringify({ id: 8 }) },
    ]);
    await expect(cartCache.getAll()).resolves.toEqual([{ id: 8 }]);
  });

  it("load() is an alias of getAll()", async () => {
    getAll.mockResolvedValueOnce([{ raw: JSON.stringify({ id: 3 }) }]);
    await expect(cartCache.load()).resolves.toEqual([{ id: 3 }]);
  });
});

describe("count (badge = sum of visible qty)", () => {
  it("returns SUM(qty) over non-deleted rows", async () => {
    getFirst.mockResolvedValueOnce({ total: 12 });
    await expect(cartCache.count()).resolves.toBe(12);
    const [sql] = getFirst.mock.calls[0];
    expect(sql).toContain("SUM(qty)");
    expect(sql).toContain("WHERE status != 'deleted'");
  });

  it("returns 0 when the sum is null / no rows", async () => {
    getFirst.mockResolvedValueOnce({ total: null });
    await expect(cartCache.count()).resolves.toBe(0);
    getFirst.mockResolvedValueOnce(null);
    await expect(cartCache.count()).resolves.toBe(0);
  });
});

describe("getPending (the sync queue = everything not synced)", () => {
  it("selects rows whose status != 'synced'", async () => {
    const rows = [
      { id: "1", qty: 2, raw: "{}", status: "pending" },
      { id: "2", qty: 0, raw: "{}", status: "deleted" },
    ];
    getAll.mockResolvedValueOnce(rows);
    await expect(cartCache.getPending()).resolves.toBe(rows);
    const [sql] = getAll.mock.calls[0];
    expect(sql).toContain("WHERE status != 'synced'");
  });
});

describe("queue transitions", () => {
  it("markSynced flips a pushed row back to 'synced'", async () => {
    await cartCache.markSynced("7");
    expect(run).toHaveBeenCalledWith(
      "UPDATE cart SET status = 'synced' WHERE id = ?;",
      ["7"]
    );
  });

  it("hardRemove drops a tombstone by id", async () => {
    await cartCache.hardRemove("7");
    expect(run).toHaveBeenCalledWith("DELETE FROM cart WHERE id = ?;", ["7"]);
  });

  it("clear wipes the whole table", async () => {
    await cartCache.clear();
    expect(run).toHaveBeenCalledWith("DELETE FROM cart;");
  });
});

describe("save (blob write: delete-all then insert each as 'synced')", () => {
  it("deletes all rows then inserts each item as synced", async () => {
    await cartCache.save([
      { id: 1, productId: 10, qty: 2 },
      { productId: 20, quantity: 5 }, // no id -> falls back to productId
    ]);
    expect(txn.runAsync).toHaveBeenCalledTimes(3); // 1 delete + 2 inserts
    expect(txn.runAsync.mock.calls[0][0]).toBe("DELETE FROM cart;");

    const firstInsert = txn.runAsync.mock.calls[1];
    expect(firstInsert[0]).toContain("VALUES (?, ?, ?, ?, 'synced', ?)");
    expect(firstInsert[1][0]).toBe("1");

    // id fallback chain id -> productId -> product_id; qty falls back to quantity
    const secondInsert = txn.runAsync.mock.calls[2];
    expect(secondInsert[1][0]).toBe("20"); // id from productId
    expect(secondInsert[1][2]).toBe(5); // qty from quantity
  });

  it("empty array still clears the table (delete only)", async () => {
    await cartCache.save([]);
    expect(txn.runAsync).toHaveBeenCalledTimes(1);
    expect(txn.runAsync.mock.calls[0][0]).toBe("DELETE FROM cart;");
  });

  it("tolerates null items and swallows errors", async () => {
    instance.mockResolvedValueOnce({
      withExclusiveTransactionAsync: async () => {
        throw new Error("locked");
      },
    });
    await expect(cartCache.save([{ id: 1 }])).resolves.toBeUndefined();
    expect(console.error).toHaveBeenCalled();
  });
});
