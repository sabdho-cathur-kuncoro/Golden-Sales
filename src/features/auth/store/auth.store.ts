// import { authStorage } from "@/storage/auth.storage";
// import { TypeUser } from "@/type/user.type";
// import { create } from "zustand";

// type AuthState = {
//   user: TypeUser | null;
//   token: string | null;
//   isAuthenticated: boolean;
//   isLoading: boolean;
//   isHydrated: boolean;

//   // actions
//   login: (data: { token: string; user: any }) => Promise<void>;
//   logout: () => Promise<void>;
//   hydrate: () => Promise<void>;
// };

// export const useAuthStore = create<AuthState>((set, get) => ({
//   user: null,
//   token: null,
//   isAuthenticated: false,
//   isLoading: true,
//   isHydrated: false,

//   // INIT (auto login)
//   hydrate: async () => {
//     try {
//       const data = await authStorage.get();

//       if (data?.accessToken) {
//         set({
//           token: data.accessToken,
//           user: data.user,
//           isAuthenticated: true,
//         });
//       }
//     } catch (e) {
//       console.error("[Auth:hydrate]", e);
//     } finally {
//       set({ isHydrated: true });
//     }
//   },

//   // LOGIN
//   login: async ({ token, user }) => {
//     try {
//       await authStorage.set({
//         accessToken: token,
//         user,
//       });

//       set({
//         token,
//         user,
//         isAuthenticated: true,
//       });
//     } catch (e) {
//       console.error("[Auth:login]", e);
//     }
//   },

//   // LOGOUT
//   logout: async () => {
//     try {
//       await authStorage.clear();

//       set({
//         token: null,
//         user: null,
//         isAuthenticated: false,
//       });
//     } catch (e) {
//       console.error("[Auth:logout]", e);
//     }
//   },
// }));
