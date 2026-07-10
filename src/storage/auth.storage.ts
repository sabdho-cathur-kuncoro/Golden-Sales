import { TypeUser } from "@/type/user.type";
import { STORAGE_KEYS } from "./keys";
import { secureStore } from "./secure.store";

type AuthPayload = {
  accessToken: string;
  refreshToken?: string;
  user: TypeUser;
};

export const authStorage = {
  set: async (data: AuthPayload) => {
    const ops: Promise<void>[] = [
      secureStore.set(STORAGE_KEYS.ACCESS_TOKEN, data.accessToken),
      secureStore.set(STORAGE_KEYS.USER, data.user),
    ];
    // Only touch the refresh token when explicitly provided, so a profile-only
    // re-save (setUser, which omits it) never wipes the stored refresh token.
    if (data.refreshToken !== undefined) {
      ops.push(secureStore.set(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken));
    }
    await Promise.all(ops);
  },

  get: async (): Promise<AuthPayload | null> => {
    const [token, refreshToken, user] = await Promise.all([
      secureStore.get<string>(STORAGE_KEYS.ACCESS_TOKEN),
      secureStore.get<string>(STORAGE_KEYS.REFRESH_TOKEN),
      secureStore.get<any>(STORAGE_KEYS.USER),
    ]);

    if (!token) return null;

    return {
      accessToken: token,
      refreshToken: refreshToken ?? undefined,
      user,
    };
  },

  clear: async () => {
    await Promise.all([
      secureStore.remove(STORAGE_KEYS.ACCESS_TOKEN),
      secureStore.remove(STORAGE_KEYS.REFRESH_TOKEN),
      secureStore.remove(STORAGE_KEYS.USER),
    ]);
  },
};
