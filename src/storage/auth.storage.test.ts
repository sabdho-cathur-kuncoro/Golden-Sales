// Mock the secure-storage abstraction; assert auth.storage persists/reads the
// token+user under the right STORAGE_KEYS. Inline jest.fn()s in the factory,
// then import the mocked module and cast.
jest.mock("./secure.store", () => ({
  secureStore: {
    set: jest.fn(),
    get: jest.fn(),
    remove: jest.fn(),
  },
}));

import { authStorage } from "./auth.storage";
import { STORAGE_KEYS } from "./keys";
import { secureStore } from "./secure.store";

const setMock = secureStore.set as jest.Mock;
const getMock = secureStore.get as jest.Mock;
const removeMock = secureStore.remove as jest.Mock;

beforeEach(() => {
  setMock.mockReset().mockResolvedValue(undefined);
  getMock.mockReset().mockResolvedValue(null);
  removeMock.mockReset().mockResolvedValue(undefined);
});

describe("set", () => {
  it("persists access token + user under their keys", async () => {
    const user = { id: 1, name: "Budi" } as any;
    await authStorage.set({ accessToken: "t", user });
    expect(setMock).toHaveBeenCalledWith(STORAGE_KEYS.ACCESS_TOKEN, "t");
    expect(setMock).toHaveBeenCalledWith(STORAGE_KEYS.USER, user);
  });

  it("does NOT touch the refresh token when it is omitted", async () => {
    await authStorage.set({ accessToken: "t", user: { id: 1 } as any });
    const touchedKeys = setMock.mock.calls.map((c) => c[0]);
    expect(touchedKeys).not.toContain(STORAGE_KEYS.REFRESH_TOKEN);
  });

  it("persists the refresh token when provided", async () => {
    await authStorage.set({
      accessToken: "t",
      refreshToken: "r",
      user: { id: 1 } as any,
    });
    expect(setMock).toHaveBeenCalledWith(STORAGE_KEYS.REFRESH_TOKEN, "r");
  });

  it("writes an explicit empty-string refresh token (undefined-guard, not falsy)", async () => {
    await authStorage.set({
      accessToken: "t",
      refreshToken: "",
      user: { id: 1 } as any,
    });
    expect(setMock).toHaveBeenCalledWith(STORAGE_KEYS.REFRESH_TOKEN, "");
  });
});

describe("get", () => {
  it("returns null when there is no access token", async () => {
    getMock.mockResolvedValue(null);
    await expect(authStorage.get()).resolves.toBeNull();
  });

  it("assembles the payload from the three keys", async () => {
    getMock.mockImplementation(async (key: string) => {
      if (key === STORAGE_KEYS.ACCESS_TOKEN) return "t";
      if (key === STORAGE_KEYS.REFRESH_TOKEN) return "r";
      if (key === STORAGE_KEYS.USER) return { id: 9 };
      return null;
    });
    await expect(authStorage.get()).resolves.toEqual({
      accessToken: "t",
      refreshToken: "r",
      user: { id: 9 },
    });
  });

  it("maps a missing refresh token to undefined", async () => {
    getMock.mockImplementation(async (key: string) => {
      if (key === STORAGE_KEYS.ACCESS_TOKEN) return "t";
      if (key === STORAGE_KEYS.USER) return { id: 9 };
      return null; // refresh token absent
    });
    const payload = await authStorage.get();
    expect(payload?.refreshToken).toBeUndefined();
  });
});

describe("clear", () => {
  it("removes all three keys", async () => {
    await authStorage.clear();
    expect(removeMock).toHaveBeenCalledWith(STORAGE_KEYS.ACCESS_TOKEN);
    expect(removeMock).toHaveBeenCalledWith(STORAGE_KEYS.REFRESH_TOKEN);
    expect(removeMock).toHaveBeenCalledWith(STORAGE_KEYS.USER);
    expect(removeMock).toHaveBeenCalledTimes(3);
  });
});
