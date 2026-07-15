// Mock expo-secure-store. Define jest.fn()s inline in the factory, then import
// the mocked module and cast so assertions target the exact instances called.
jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

import * as SecureStore from "expo-secure-store";
import { STORAGE_KEYS } from "./keys";
import { secureStore } from "./secure.store";

const getItemAsync = SecureStore.getItemAsync as jest.Mock;
const setItemAsync = SecureStore.setItemAsync as jest.Mock;
const deleteItemAsync = SecureStore.deleteItemAsync as jest.Mock;

beforeEach(() => {
  getItemAsync.mockReset();
  setItemAsync.mockReset().mockResolvedValue(undefined);
  deleteItemAsync.mockReset().mockResolvedValue(undefined);
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  (console.error as jest.Mock).mockRestore?.();
});

describe("set", () => {
  it("stores strings verbatim (no JSON quoting)", async () => {
    await secureStore.set("k", "hello");
    expect(setItemAsync).toHaveBeenCalledWith("k", "hello", {
      requireAuthentication: false,
    });
  });

  it("JSON-encodes non-string values", async () => {
    await secureStore.set("k", { id: 1, name: "Budi" });
    expect(setItemAsync).toHaveBeenCalledWith(
      "k",
      JSON.stringify({ id: 1, name: "Budi" }),
      { requireAuthentication: false }
    );
  });

  it("passes requireAuth through as the biometric option", async () => {
    await secureStore.set("k", "v", { requireAuth: true });
    expect(setItemAsync).toHaveBeenCalledWith("k", "v", {
      requireAuthentication: true,
    });
  });

  it("swallows write errors (logs, does not throw)", async () => {
    setItemAsync.mockRejectedValueOnce(new Error("keychain fail"));
    await expect(secureStore.set("k", "v")).resolves.toBeUndefined();
    expect(console.error).toHaveBeenCalled();
  });
});

describe("get", () => {
  it("JSON-parses stored objects", async () => {
    getItemAsync.mockResolvedValueOnce(JSON.stringify({ id: 1 }));
    await expect(secureStore.get("k")).resolves.toEqual({ id: 1 });
  });

  it("returns the raw string when the value is not valid JSON", async () => {
    getItemAsync.mockResolvedValueOnce("plain-token");
    await expect(secureStore.get<string>("k")).resolves.toBe("plain-token");
  });

  it("returns null when nothing is stored", async () => {
    getItemAsync.mockResolvedValueOnce(null);
    await expect(secureStore.get("k")).resolves.toBeNull();
  });

  it("returns null and logs on a read error", async () => {
    getItemAsync.mockRejectedValueOnce(new Error("locked"));
    await expect(secureStore.get("k")).resolves.toBeNull();
    expect(console.error).toHaveBeenCalled();
  });
});

describe("remove", () => {
  it("deletes the key", async () => {
    await secureStore.remove("k");
    expect(deleteItemAsync).toHaveBeenCalledWith("k");
  });

  it("swallows delete errors", async () => {
    deleteItemAsync.mockRejectedValueOnce(new Error("fail"));
    await expect(secureStore.remove("k")).resolves.toBeUndefined();
    expect(console.error).toHaveBeenCalled();
  });
});

describe("clearAll", () => {
  it("removes every STORAGE_KEYS entry", async () => {
    await secureStore.clearAll();
    const removed = deleteItemAsync.mock.calls.map((c) => c[0]);
    expect(removed).toEqual(expect.arrayContaining(Object.values(STORAGE_KEYS)));
    expect(deleteItemAsync).toHaveBeenCalledTimes(
      Object.values(STORAGE_KEYS).length
    );
  });
});
