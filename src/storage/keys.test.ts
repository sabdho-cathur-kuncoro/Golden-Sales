import { DB_NAME, DB_VERSION, STORAGE_KEYS } from "./keys";

describe("STORAGE_KEYS", () => {
  it("exposes the three secure-storage keys", () => {
    expect(STORAGE_KEYS).toEqual({
      ACCESS_TOKEN: "access_token",
      REFRESH_TOKEN: "refresh_token",
      USER: "user",
    });
  });

  it("has stable, distinct string values", () => {
    const values = Object.values(STORAGE_KEYS);
    expect(values.every((v) => typeof v === "string" && v.length > 0)).toBe(true);
    expect(new Set(values).size).toBe(values.length);
  });
});

describe("DB constants", () => {
  it("names the sqlite database file", () => {
    expect(DB_NAME).toBe("belanja_yuk.db");
  });

  it("declares a numeric schema version", () => {
    expect(typeof DB_VERSION).toBe("number");
    expect(DB_VERSION).toBe(1);
  });
});
