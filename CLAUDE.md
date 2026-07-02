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

- `npm start` — start Expo dev server (`expo start`)
- `npm run android` / `npm run ios` — `expo run:android` / `expo run:ios`: **prebuild** build + launch on device/emulator (needs the native toolchain — Android Studio / Xcode; not Expo Go)
- `npm run web` — `expo start --web`
- `npm run lint` — `expo lint` (ESLint via Expo config)
- `npm run reset-project` — moves starter code to `app-example/`, resets `app/` (template script, not normally needed here)

This is a **bare / prebuild (CNG) app**, not managed/Expo Go: `android/` + `ios/` dirs are committed, config lives in `app.config.js` (not `app.json`), and a custom `index.js` is the entry (`package.json` `main`). Stack: Expo SDK ~55, React Native 0.83, React 19, expo-router ~55, reanimated 4 (+ worklets); experiments `typedRoutes` + `reactCompiler` are on (`app.config.js`).

No test runner is configured (no Jest setup, no test scripts in `package.json`).

## Architecture

**Expo Router app, file-based routing rooted at `src/app`** (not the repo-root `app/`). Path aliases: `@/*` → `./src/*`, `@/assets/*` → `./assets/*` (see `tsconfig.json`).

Route layout:

- `src/app/index.tsx` — `BootstrapScreen`: the app entry route; runs the boot sequence (see **Boot** below) behind an `AnimatedSplash`, then `router.replace`s to `/home` or `/login`.
- `src/app/_layout.tsx` — root layout: loads Satoshi font family, shows splash until fonts ready, wraps everything in `GestureHandlerRootView` + `KeyboardProvider`, and mounts the **global UI singletons** (`AppBottomSheet`, `Toast`, `GlobalConfirmModal`, `GlobalInputModal`, `GlobalPrePermissionModal`, `GlobalLoading`, plus the headless `NotificationPoller` + `PushNotifications`). Stack registers `(auth)`, `(tabs)`, and `scan` (opens as a **modal**).
- `(auth)` (`login`, `forgot-password/`) and `(tabs)` (`home`, `profil`, `request`, `transaksi`) are route groups (stacks/tabs); most other top-level dirs under `src/app` (`cart`, `catalog`, `order`, `order-chat`, `checkout`, `payment`, `payment-method`, `konfirmasi-order`, `transaksi-detail`, `invoice`, `report`, `return`, `request-product`, `approval`, `approval-detail`, `customer`, `notifikasi`, `notification-preferences`, `status-order`, `status-screen`, `profil-detail`, `change-password`, `pin`, `faq`, `manual-book`, `scan`, ...) are standalone stacked screens, each with its own `_layout.tsx`.
- Route/UI copy is in **Bahasa Indonesia** (e.g. `transaksi`, `profil`, `konfirmasi-order`, "Masuk ke Akun Anda") — keep new screens consistent with this.

**Global UI is driven imperatively through Zustand stores, not local component state.** To show a toast, bottom sheet, confirm dialog, or input prompt from anywhere in the app, call the corresponding store/hook rather than rendering a component inline — the actual UI is mounted once in the root layout and reads from the store:

- `useToast()` (`src/hooks/useToast.ts`) → `success/error/warning/info`, backed by `toast.store.ts`, rendered by `components/ui/Toast`
- `useBottomSheetStore` (`stores/bottomSheet.store.ts`) `.open(content, snapPoints?, header?, footer?)` / `.close()`, rendered by `components/ui/AppBottomSheet`
- `useConfirmStore` (`stores/confirm.store.ts`) `.show({ title, message, type, onConfirm })`, rendered by `components/modal/GlobalConfirmModal`
- `useInputModalStore` (`stores/input.store.ts`) `.showInput({ title, placeholder, onConfirm })`, rendered by `components/modal/GlobalInputModal`
- `usePrePermissionStore` (`stores/prePermission.store.ts`) — soft pre-permission priming sheet, rendered by `components/modal/GlobalPrePermissionModal`
- `useLoading` / `loading.store.ts` — global blocking spinner, rendered by `components/ui/GlobalLoading`
- `useGlobalStore` (`stores/global.store.ts`) — misc cross-screen state (e.g. selected address)

Two **headless singletons** also mount in the root layout (no UI of their own): `NotificationPoller` (in-app unread bell-badge poller, see Push notifications) and `PushNotifications` (FCM/notifee foreground wiring).

**Zustand stores** (`src/stores/`): the UI-singleton stores above (`toast`, `bottomSheet`, `confirm`, `input`, `prePermission`, `loading`, `global`), plus `auth.store.ts` (see Auth), `cart.store.ts`, `notification.store.ts` (unread count + polling), and `permission.store.ts` (native permission state).

**Data layer now hits a real backend via axios.** `src/constants/dummy.ts` still exists but services no longer return it — they call live endpoints. When wiring a screen, follow the existing seams:

- `src/constants/API.ts` builds two axios clients off `Config.BASE_URL` (`EXPO_PUBLIC_API_BASE_URL` from `.env`): `APIBASIC` (no auth — login/register/forgot-password) and `APIBEARER` (request interceptor injects `Authorization: Bearer <token>` from `useAuthStore.getState().token`; response interceptor has a stubbed 401 refresh-token flow left commented out).
- `src/services/*.services.ts` (note: `.services.ts`, the old `*.service.tsx` files are gone) wrap endpoints. Each `*Service` fn returns `res.data` on 200 and rethrows `new Error(errMsg ?? msg ?? "Terjadi Kesalahan")` on failure; `__DEV__`-gated `console.log`. Grouped by domain: `auth` (`/login`, `/register`, `/me`, `/me/profile`, `/forgot-password/*`, `/me/password`), `catalog` (`svc/Categories/*`, `svc/SubCategories/*`), `products` (`/products/GetAll`, `/products/Details/:id`), `cart`, `orders` (`/orders`, `/orders/mine`, `/orders/create`, `/complete`, `/confirm-receipt`, `/vouchers/validate`, `/orders/:id/messages`, `/orders/:id/timeline`), `approval` (`/orders/:id/review|approve|reject`), `notification` (`/notifications*`), `global` (`/warehouses`, `/sliders`, `/flash-sales`), `sale` (canvassing/sales: `/sell/stock`, `/sell/check`, `/sell/history`, `/customers` + create/detail/check-code/check-phone, `/registrations/pending`, `/customers/:id/status-request`, `/manual`), and `push` (FCM device-token registration — see Push notifications).
- **Offline cache pattern**: some services have a `*Cached` variant (`getProductsCachedService`, `getCartsCachedService`) — online-first: fetch → upsert into SQLite → return fresh; on error fall back to the cached rows.
- `src/hooks/use*.tsx` (e.g. `useCatalog`) wrap services in `useCallback`/`useState`, route errors through `useToast().warning(...)`, and gate `console.log` behind `__DEV__`. `hooks/useLogin.ts` is still a stub.

**Auth + persistent storage** (`src/storage/`, `src/stores/auth.store.ts`, `src/type/user.type.ts`):

- `auth.store.ts` (Zustand) holds `user: TypeUser | null`, `token`, `isAuthenticated`, `isHydrated`. Actions: `login({token, user})`, `logout()`, `hydrate()` (auto-login from storage on boot). Auth services call `useAuthStore.getState().login(...)` directly.
- `storage/secure.store.ts` — `secureStore` wraps `expo-secure-store` (JSON-encodes, optional biometric `requireAuth`); `storage/auth.storage.ts` persists token+user under `STORAGE_KEYS` (`storage/keys.ts`).
- `storage/db.ts` — `db` singleton over `expo-sqlite` (DB `belanja_yuk.db`, `DB_VERSION=1`); idempotent `MIGRATIONS` create the `product_cache` and `cart` tables (the legacy `products` table is `DROP`ped first); call `db.init()` once on boot before any query.
- `storage/product.cache.ts` (`productsCache`) and `storage/cart.cache.ts` (`cartCache`) — read/write those tables, storing the full API object in a `raw` TEXT column. `cartCache` implements an offline **sync queue**: rows carry `status` `'synced' | 'pending' | 'deleted'`; local edits mark `pending`, deletes leave `deleted` tombstones, `getPending()`/`markSynced()`/`hardRemove()` drain it to the server — `upsertFromServer` never clobbers unpushed local rows.
- **Boot sequence** (`src/app/index.tsx` `BootstrapScreen`): on mount it awaits `db.init()` then `useAuthStore.getState().hydrate()` (auto-login from storage); if authenticated it kicks off a background `getProfileService()` refresh, runs an `AnimatedSplash`, and once hydration + animation finish `router.replace`s to `/home` or `/login`. (Previously stubbed out — now live.)

**Push notifications run on FCM + notifee** (`@react-native-firebase/messaging` + `@notifee/react-native`; `expo-notifications` was removed). This spans native config, a background entry, and a foreground orchestration hook:

- `index.js` (repo root, the app's `main` entry) registers **module-scope background handlers OUTSIDE the React tree** — `messaging().setBackgroundMessageHandler` (renders background/killed data messages via notifee) and `notifee.onBackgroundEvent` — then `require("expo-router/entry")` last.
- `src/notifications/` holds the foreground pieces: `usePushNotifications.ts` (auth-gated: on login it runs `ensureChannels()` → request permission → `getFcmToken()` → `registerTokenWithBackend()` → subscribe to `DEFAULT_TOPICS = ["sales"]`, wires `onMessage` / `onNotificationOpenedApp` / `onForegroundEvent` / `onTokenRefresh`, and handles cold-start via `getInitialNotification`); `channels.ts` (Android channels `orders` / `approvals` / `general`); `display.ts` (`displayFcmMessage` — the single render path); `navigation.ts` (`handleNotificationOpen` deep-links via `router.push(data.route)`).
- **Message contract**: the backend sends FCM **data** messages `{ title, body, route, notifId, channelId }` — `notifId` is the stable notification id (dedupe / targeted cancel), `route` is the deep-link target.
- `src/services/push.services.ts` — transport only: `requestPushPermission`, `getFcmToken`, `subscribeTopic` / `unsubscribeTopic`, `registerTokenWithBackend` (POST `/notifications/device-token`). Uses the modular API `getMessaging(getApp())`.
- Two headless root-layout components: `components/PushNotifications.tsx` (just calls `usePushNotifications()`) and `components/NotificationPoller.tsx` (in-app unread bell-badge poller via `notification.store`, refetches on `AppState` active — this is separate from push and drives the badge, not the OS notifications).
- **Native config**: Firebase files `config/google-services.json` + `config/GoogleService-Info.plist` (wired in `app.config.js`, with generated copies under `android/` / `ios/`). `app.config.js` plugins: `@react-native-firebase/app` + `/messaging`, and `expo-build-properties` (iOS `useFrameworks: "static"`, Android maven repo for notifee's bundled AAR). No root `firebase.json`.

**Theming is centralized in `src/constants/theme.ts`** — colors, spacing constants (`SPACE_4`...`SPACE_64`), `FontFamily` (maps to the loaded Satoshi font weights), prebuilt text styles (`whiteTextStyle`, `blueTextStyle`, `greyTextStyle`, ...) and shared style objects (`shadow`, `rowCenter`, `mainContent`, `screen`, `line`, `paddingH`, ...). Compose these with `StyleSheet.create` rather than hardcoding colors/fonts/spacing inline. There is no Tailwind/NativeWind despite the `global.css` import in `theme.ts` (it only defines CSS custom properties for web font fallbacks).

**Component organization** under `src/components`:

- `ui/` — generic building blocks, re-exported from `ui/index.ts` (`Button`, `Header`, `Gap`, tile components like `TileCart`/`TileOrder`/`TileNotif`, `Toast`, `AppBottomSheet`, ...)
- `form/` — form inputs (`FormInput`, `FormPassword`), re-exported from `form/index.ts`
- `layout/` — `Screen` wraps content in `SafeAreaView` with the app background and horizontal padding; use it as the outer wrapper for new screens
- `modal/` — global modals driven by the Zustand stores above

**Misc utilities**: root-level `utils/` (note: separate from `src/`) has `currencyFormat`, `days` (dayjs wrapper), and `helper` (`handleBack` for router back/replace fallback, `wait`, `generateChat` for grouping chat messages by day). `src/constants/dummy.ts` still holds mock data but is now legacy — services hit the real API (see Data layer above).

**Other notable features / deps**:

- **Manual book** (`manual-book/`) — renders the sales manual as an in-app PDF via `react-native-pdf`, sourced from `getSalesManualService()` (`GET /manual`, base64), with `expo-file-system` + `expo-sharing` download/share. Entry point from `(tabs)/profil`.
- **Barcode/QR scan** (`scan/`, opened as a modal) — uses `react-native-vision-camera`; camera permission via `useCameraAccess` / `permission.store`.
- **Hooks** (`src/hooks/`) follow the service-wrapping pattern (`useCallback`/`useState`, errors → `useToast().warning`, `__DEV__` logs). Beyond `useCatalog`/`useProducts`/`useCart`, newer controllers cover customer CRUD (`useCustomers`, `useCustomerDetail`, `useCreateCustomer`), sales/return history (`useSalesHistory`, `useReturnHistory`), orders (`useMyOrders`, `useApprovalOrders`, `useOrderDetailController`), and device access (`useCameraAccess`, `useNotificationAccess`).
