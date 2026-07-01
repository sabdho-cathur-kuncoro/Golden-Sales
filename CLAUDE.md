# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Domain

Internal app for **sales employees** ("Golden Communication") who canvass customers/outlets, manage stock requests, and route orders through approval. Core features and where they live:

- **Request items from warehouse** — `request-product/` ("Minta Barang"): browse stock by category, submit a request to the warehouse.
- **Order on behalf of a customer (canvassing)** — `order/` flow: pick outlet + delivery address → `order/product` → `order/[id]` → `order/rincian` (review + payment method) → `payment-method`/`payment` → `status-screen`.
- **Report finished/rejected orders** — `report/` ("Laporan"): orders with terminal `status_order` (done/rejected); separate from `(tabs)/transaksi` which lists _all_ orders regardless of status.
- **Product catalog** — `catalog/` (list + `[id]` detail), browsable independent of the order/request flows.
- **Approve customer orders** — `(tabs)/approval` tab → `approval-detail/` (multi-step approval timeline via `StatusRow`, incl. reject-with-reason).

## Commands

- `npm start` — start Expo dev server
- `npm run android` / `npm run ios` / `npm run web` — run on platform (build + launch)
- `npm run lint` — `expo lint` (ESLint via Expo config)
- `npm run reset-project` — moves starter code to `app-example/`, resets `app/` (template script, not normally needed here)

No test runner is configured (no Jest setup, no test scripts in `package.json`).

## Architecture

**Expo Router app, file-based routing rooted at `src/app`** (not the repo-root `app/`). Path aliases: `@/*` → `./src/*`, `@/assets/*` → `./assets/*` (see `tsconfig.json`).

Route layout:

- `src/app/_layout.tsx` — root layout: loads Satoshi font family, shows splash until fonts ready, wraps everything in `GestureHandlerRootView` + `KeyboardProvider`, and mounts the **global UI singletons** (`AppBottomSheet`, `Toast`, `GlobalConfirmModal`, `GlobalInputModal`).
- `(auth)` and `(tabs)` are route groups (stacks/tabs); most other top-level dirs under `src/app` (`cart`, `catalog`, `order`, `payment`, `payment-method`, `konfirmasi-order`, `transaksi-detail`, `report`, `request-product`, `notifikasi`, `status-order`, `approval-detail`, `profil-detail`, `status-screen`, ...) are standalone stacked screens, each with its own `_layout.tsx`.
- Route/UI copy is in **Bahasa Indonesia** (e.g. `transaksi`, `profil`, `konfirmasi-order`, "Masuk ke Akun Anda") — keep new screens consistent with this.

**Global UI is driven imperatively through Zustand stores, not local component state.** To show a toast, bottom sheet, confirm dialog, or input prompt from anywhere in the app, call the corresponding store/hook rather than rendering a component inline — the actual UI is mounted once in the root layout and reads from the store:

- `useToast()` (`src/hooks/useToast.ts`) → `success/error/warning/info`, backed by `toast.store.ts`, rendered by `components/ui/Toast`
- `useBottomSheetStore` (`stores/bottomSheet.store.ts`) `.open(content, snapPoints?, header?, footer?)` / `.close()`, rendered by `components/ui/AppBottomSheet`
- `useConfirmStore` (`stores/confirm.store.ts`) `.show({ title, message, type, onConfirm })`, rendered by `components/modal/GlobalConfirmModal`
- `useInputModalStore` (`stores/input.store.ts`) `.showInput({ title, placeholder, onConfirm })`, rendered by `components/modal/GlobalInputModal`
- `useGlobalStore` (`stores/global.store.ts`) — misc cross-screen state (e.g. selected address)

**Data layer now hits a real backend via axios.** `src/constants/dummy.ts` still exists but services no longer return it — they call live endpoints. When wiring a screen, follow the existing seams:

- `src/constants/API.ts` builds two axios clients off `Config.BASE_URL` (`EXPO_PUBLIC_API_BASE_URL` from `.env`): `APIBASIC` (no auth — login/register/forgot-password) and `APIBEARER` (request interceptor injects `Authorization: Bearer <token>` from `useAuthStore.getState().token`; response interceptor has a stubbed 401 refresh-token flow left commented out).
- `src/services/*.services.ts` (note: `.services.ts`, the old `*.service.tsx` files are gone) wrap endpoints. Each `*Service` fn returns `res.data` on 200 and rethrows `new Error(errMsg ?? msg ?? "Terjadi Kesalahan")` on failure; `__DEV__`-gated `console.log`. Grouped by domain: `auth` (`/login`, `/register`, `/me`, `/forgot-password/*`, `/me/password`), `catalog` (`svc/Categories/*`, `svc/SubCategories/*`), `products` (`/products/GetAll`, `/products/Details/:id`), `cart`, `orders`, `approval` (`/orders/:id/approve|reject`), `notification`, `global` (`/warehouses`).
- **Offline cache pattern**: some services have a `*Cached` variant (`getProductsCachedService`, `getCartsCachedService`) — online-first: fetch → upsert into SQLite → return fresh; on error fall back to the cached rows.
- `src/hooks/use*.tsx` (e.g. `useCatalog`) wrap services in `useCallback`/`useState`, route errors through `useToast().warning(...)`, and gate `console.log` behind `__DEV__`. `hooks/useLogin.ts` is still a stub.

**Auth + persistent storage** (`src/storage/`, `src/stores/auth.store.ts`, `src/type/user.type.ts`):

- `auth.store.ts` (Zustand) holds `user: TypeUser | null`, `token`, `isAuthenticated`, `isHydrated`. Actions: `login({token, user})`, `logout()`, `hydrate()` (auto-login from storage on boot). Auth services call `useAuthStore.getState().login(...)` directly.
- `storage/secure.store.ts` — `secureStore` wraps `expo-secure-store` (JSON-encodes, optional biometric `requireAuth`); `storage/auth.storage.ts` persists token+user under `STORAGE_KEYS` (`storage/keys.ts`).
- `storage/db.ts` — `db` singleton over `expo-sqlite` (DB `belanja_yuk.db`); idempotent `MIGRATIONS` (`products`, `cart` tables, `IF NOT EXISTS`); call `db.init()` once on boot before any query.
- `storage/product.cache.ts` (`productsCache`) and `storage/cart.cache.ts` (`cartCache`) — read/write those tables, storing the full API object in a `raw` TEXT column. `cartCache` implements an offline **sync queue**: rows carry `status` `'synced' | 'pending' | 'deleted'`; local edits mark `pending`, deletes leave `deleted` tombstones, `getPending()`/`markSynced()`/`hardRemove()` drain it to the server — `upsertFromServer` never clobbers unpushed local rows.
- **Not yet wired into boot**: `db.init()` and `hydrate()` aren't called in `_layout.tsx`; `src/app/index.tsx` has the hydrate/splash gate commented out. The pieces exist but app start doesn't invoke them yet.

**Theming is centralized in `src/constants/theme.ts`** — colors, spacing constants (`SPACE_4`...`SPACE_64`), `FontFamily` (maps to the loaded Satoshi font weights), prebuilt text styles (`whiteTextStyle`, `blueTextStyle`, `greyTextStyle`, ...) and shared style objects (`shadow`, `rowCenter`, `mainContent`, `screen`, `line`, `paddingH`, ...). Compose these with `StyleSheet.create` rather than hardcoding colors/fonts/spacing inline. There is no Tailwind/NativeWind despite the `global.css` import in `theme.ts` (it only defines CSS custom properties for web font fallbacks).

**Component organization** under `src/components`:

- `ui/` — generic building blocks, re-exported from `ui/index.ts` (`Button`, `Header`, `Gap`, tile components like `TileCart`/`TileOrder`/`TileNotif`, `Toast`, `AppBottomSheet`, ...)
- `form/` — form inputs (`FormInput`, `FormPassword`), re-exported from `form/index.ts`
- `layout/` — `Screen` wraps content in `SafeAreaView` with the app background and horizontal padding; use it as the outer wrapper for new screens
- `modal/` — global modals driven by the Zustand stores above

**Misc utilities**: root-level `utils/` (note: separate from `src/`) has `currencyFormat`, `days` (dayjs wrapper), and `helper` (`handleBack` for router back/replace fallback, `wait`, `generateChat` for grouping chat messages by day). `src/constants/dummy.ts` still holds mock data but is now legacy — services hit the real API (see Data layer above).
