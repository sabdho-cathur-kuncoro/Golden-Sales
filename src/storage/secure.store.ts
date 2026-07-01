import * as SecureStore from "expo-secure-store";
import { STORAGE_KEYS } from "./keys";

type SetOptions = {
  requireAuth?: boolean;
};

class SecureStorage {
  async set<T>(key: string, value: T, options?: SetOptions) {
    try {
      const stringValue =
        typeof value === "string" ? value : JSON.stringify(value);

      await SecureStore.setItemAsync(key, stringValue, {
        requireAuthentication: options?.requireAuth ?? false,
      });
    } catch (error) {
      console.error("[SecureStore:set]", key, error);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await SecureStore.getItemAsync(key);

      if (!value) return null;

      try {
        return JSON.parse(value);
      } catch {
        return value as unknown as T;
      }
    } catch (error) {
      console.error("[SecureStore:get]", key, error);
      return null;
    }
  }

  async remove(key: string) {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error("[SecureStore:remove]", key, error);
    }
  }

  async clearAll() {
    try {
      const keys = Object.values(STORAGE_KEYS);

      await Promise.all(keys.map((key) => this.remove(key)));
    } catch (error) {
      console.error("[SecureStore:clearAll]", error);
    }
  }
}

export const secureStore = new SecureStorage();
