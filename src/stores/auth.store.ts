import { authStorage } from "@/storage/auth.storage";
import { TypeUser } from "@/type/user.type";
import { create } from "zustand";

type AuthState = {
  user: TypeUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;

  // actions
  login: (data: { token: string; user: any }) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
  setUser: (user: any) => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  isHydrated: false,

  // INIT (auto login)
  hydrate: async () => {
    try {
      const data = await authStorage.get();

      if (data?.accessToken) {
        set({
          token: data.accessToken,
          user: data.user,
          isAuthenticated: true,
        });
      }
    } catch (e) {
      console.error("[Auth:hydrate]", e);
    } finally {
      set({ isHydrated: true });
    }
  },

  // LOGIN
  login: async ({ token, user }) => {
    // Set state synchronously first so APIBEARER's request interceptor can read
    // the token immediately (e.g. the post-login background GET /me). Persisting
    // to secure storage is async and must not gate the in-memory session.
    set({
      token,
      user,
      isAuthenticated: true,
    });

    try {
      await authStorage.set({
        accessToken: token,
        user,
      });
    } catch (e) {
      console.error("[Auth:login]", e);
    }
  },

  // SET USER (profile-only refresh; keeps token)
  setUser: async (user) => {
    try {
      const token = get().token;
      if (!token) return;

      // /me refresh may omit topic — preserve the one from login.
      const prev = get().user;
      const merged = {
        ...user,
        topic: user?.topic ?? prev?.topic ?? null,
      };

      await authStorage.set({
        accessToken: token,
        user: merged,
      });

      set({ user: merged });
    } catch (e) {
      console.error("[Auth:setUser]", e);
    }
  },

  // LOGOUT
  logout: async () => {
    try {
      await authStorage.clear();

      set({
        token: null,
        user: null,
        isAuthenticated: false,
      });
    } catch (e) {
      console.error("[Auth:logout]", e);
    }
  },
}));
