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

import { db } from "./db";
import { productsCache } from "./product.cache";

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

describe("upsertMany", () => {
  it("no-ops for an empty / non-array input (no transaction opened)", async () => {
    await productsCache.upsertMany([]);
    await productsCache.upsertMany(null as any);
    expect(instance).not.toHaveBeenCalled();
  });

  it("sets a busy_timeout pragma then inserts one row per product", async () => {
    await productsCache.upsertMany([
      { id: 1, name: "A", price: 100 },
      { id: 2, name: "B", price: 200 },
    ]);
    expect(txn.execAsync).toHaveBeenCalledWith("PRAGMA busy_timeout = 5000;");
    expect(txn.runAsync).toHaveBeenCalledTimes(2);
    const [sql, params] = txn.runAsync.mock.calls[0];
    expect(sql).toContain("INSERT INTO product_cache");
    expect(sql).toContain("ON CONFLICT(id, scope) DO UPDATE");
    // id coerced to string, default scope 'all', raw is JSON of the object
    expect(params[0]).toBe("1");
    expect(params[1]).toBe("all");
    expect(params[2]).toBe("A");
    expect(params[3]).toBe(100);
    expect(JSON.parse(params[4])).toEqual({ id: 1, name: "A", price: 100 });
  });

  it("writes rows under the given scope", async () => {
    await productsCache.upsertMany([{ id: 7 }], "w-42");
    const [, params] = txn.runAsync.mock.calls[0];
    expect(params[1]).toBe("w-42");
    expect(params[2]).toBeNull(); // name missing -> null
    expect(params[3]).toBeNull(); // price missing -> null
  });

  it("swallows transaction errors (logs, does not throw)", async () => {
    instance.mockResolvedValueOnce({
      withExclusiveTransactionAsync: async () => {
        throw new Error("locked");
      },
    });
    await expect(
      productsCache.upsertMany([{ id: 1 }])
    ).resolves.toBeUndefined();
    expect(console.error).toHaveBeenCalled();
  });
});

describe("getAll", () => {
  it("selects by scope and JSON-parses the raw column", async () => {
    getAll.mockResolvedValueOnce([
      { raw: JSON.stringify({ id: 1 }) },
      { raw: JSON.stringify({ id: 2 }) },
    ]);
    const result = await productsCache.getAll("w-1");
    const [sql, params] = getAll.mock.calls[0];
    expect(sql).toContain("WHERE scope = ?");
    expect(sql).toContain("ORDER BY updated_at DESC");
    expect(params).toEqual(["w-1"]);
    expect(result).toEqual([{ id: 1 }, { id: 2 }]);
  });

  it("defaults to the 'all' scope", async () => {
    await productsCache.getAll();
    expect(getAll.mock.calls[0][1]).toEqual(["all"]);
  });

  it("drops rows whose raw is not valid JSON", async () => {
    getAll.mockResolvedValueOnce([
      { raw: "{not json" },
      { raw: JSON.stringify({ id: 5 }) },
    ]);
    await expect(productsCache.getAll()).resolves.toEqual([{ id: 5 }]);
  });
});

describe("getUpdatedAt", () => {
  it("returns the MAX(updated_at) for the scope", async () => {
    getFirst.mockResolvedValueOnce({ updated_at: 1234 });
    await expect(productsCache.getUpdatedAt("w-1")).resolves.toBe(1234);
    expect(getFirst.mock.calls[0][0]).toContain("MAX(updated_at)");
    expect(getFirst.mock.calls[0][1]).toEqual(["w-1"]);
  });

  it("returns null when the scope has no rows", async () => {
    getFirst.mockResolvedValueOnce(null);
    await expect(productsCache.getUpdatedAt()).resolves.toBeNull();
  });
});

describe("clear", () => {
  it("clears a single scope when given one", async () => {
    await productsCache.clear("w-1");
    expect(run).toHaveBeenCalledWith(
      "DELETE FROM product_cache WHERE scope = ?;",
      ["w-1"]
    );
  });

  it("clears the whole cache when no scope is given", async () => {
    await productsCache.clear();
    expect(run).toHaveBeenCalledWith("DELETE FROM product_cache;");
  });
});
