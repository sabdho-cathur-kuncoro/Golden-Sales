import { TypeUser } from "@/type/user.type";
import { STORAGE_KEYS } from "./keys";
import { secureStore } from "./secure.store";

type AuthPayload = {
  accessToken: string;
  user: TypeUser;
};

export const authStorage = {
  set: async (data: AuthPayload) => {
    await Promise.all([
      secureStore.set(STORAGE_KEYS.ACCESS_TOKEN, data.accessToken),
      secureStore.set(STORAGE_KEYS.USER, data.user),
    ]);
  },

  get: async (): Promise<AuthPayload | null> => {
    const [token, user] = await Promise.all([
      secureStore.get<string>(STORAGE_KEYS.ACCESS_TOKEN),
      secureStore.get<any>(STORAGE_KEYS.USER),
    ]);

    if (!token) return null;

    return {
      accessToken: token,
      user,
    };
  },

  clear: async () => {
    await Promise.all([
      secureStore.remove(STORAGE_KEYS.ACCESS_TOKEN),
      secureStore.remove(STORAGE_KEYS.USER),
    ]);
  },
};
