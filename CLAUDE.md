# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Domain

Internal app for **sales employees** ("Golden Communication") who canvass customers/outlets, manage stock requests, and route orders through approval. Core features and where they live:

- **Request items from warehouse** — `request-product/` ("Minta Barang"): browse stock by category, submit a request to the warehouse.
- **Order on behalf of a customer (canvassing)** — `order/` flow: pick outlet + delivery address → `order/product` → `order/[id]` → `order/rincian` (review + payment method) → `payment-method`/`payment` → `status-screen`.
- **Report finished/rejected orders** — `report/` ("Laporan"): orders with terminal `status_order` (done/rejected); separate from `(tabs)/transaksi` which lists *all* orders regardless of status.
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

**Data layer is mid-migration to a real backend — most of it currently returns dummy data with the real API calls commented out.** When wiring up a screen to real data, follow the existing seams rather than inventing new ones:
- `src/services/*.service.tsx` wrap API calls (axios via a commented-out `APIBEARER`) but currently return data from `src/constants/dummy.ts`; real endpoints are left as commented-out code showing the intended request/response shape.
- `src/hooks/use*.tsx` (e.g. `useCatalog`) wrap services in `useCallback`/`useState`, route errors through `useToast().warning(...)`, and gate `console.log` behind `__DEV__`.
- `stores/auth.store.ts` and `hooks/useLogin.ts` are stubbed/commented out — auth is not yet wired up; `login.tsx` currently just `router.replace("/home")`.

**Theming is centralized in `src/constants/theme.ts`** — colors, spacing constants (`SPACE_4`...`SPACE_64`), `FontFamily` (maps to the loaded Satoshi font weights), prebuilt text styles (`whiteTextStyle`, `blueTextStyle`, `greyTextStyle`, ...) and shared style objects (`shadow`, `rowCenter`, `mainContent`, `screen`, `line`, `paddingH`, ...). Compose these with `StyleSheet.create` rather than hardcoding colors/fonts/spacing inline. There is no Tailwind/NativeWind despite the `global.css` import in `theme.ts` (it only defines CSS custom properties for web font fallbacks).

**Component organization** under `src/components`:
- `ui/` — generic building blocks, re-exported from `ui/index.ts` (`Button`, `Header`, `Gap`, tile components like `TileCart`/`TileOrder`/`TileNotif`, `Toast`, `AppBottomSheet`, ...)
- `form/` — form inputs (`FormInput`, `FormPassword`), re-exported from `form/index.ts`
- `layout/` — `Screen` wraps content in `SafeAreaView` with the app background and horizontal padding; use it as the outer wrapper for new screens
- `modal/` — global modals driven by the Zustand stores above

**Misc utilities**: root-level `utils/` (note: separate from `src/`) has `currencyFormat`, `days` (dayjs wrapper), and `helper` (`handleBack` for router back/replace fallback, `wait`, `generateChat` for grouping chat messages by day). `src/constants/dummy.ts` holds all placeholder/mock data used by services.
