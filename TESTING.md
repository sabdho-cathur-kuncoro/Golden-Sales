# Testing

Unit / integration test harness for golden-sales. Built on **[jest-expo](https://docs.expo.dev/develop/unit-testing/)** (Expo SDK 55 preset) + **[@testing-library/react-native](https://callstack.github.io/react-native-testing-library/) v14**.

## Running

```bash
npm test                 # run the whole suite once
npm run test:watch       # watch mode
npx jest <path>          # single file, e.g. npx jest src/services/orders.services.test.ts
npx jest src/hooks       # a directory
npx jest -t "<name>"     # by test name
npx jest --coverage      # coverage report
```

**Status: 147 suites, 665 tests, all passing.**

Coverage over non-route source (`src/**` + `utils/**`, excluding `src/app` route screens):

| Metric | Coverage |
| --- | --- |
| Statements | ~84% |
| Lines | ~86% |
| Functions | ~80% |
| Branches | ~67% |

## Configuration

| File | Purpose |
| --- | --- |
| `jest.config.js` | `jest-expo` preset, path-alias `moduleNameMapper`, `transformIgnorePatterns`, wires `jest.setup.js` |
| `babel.config.js` | `babel-preset-expo` — required for `babel-jest` |
| `jest.setup.js` | Global native-module mocks (see below) |
| `__mocks__/react-native-reanimated.js` | Hand-stub for reanimated 4 (its shipped `/mock` crashes headless) |
| `__mocks__/svgMock.js` | Stub for `*.svg` imports |
| `__mocks__/styleMock.js` | Stub for `*.css` imports (`@/global.css`) |
| `eslint.config.js` | Test-file override disables `rules-of-hooks` / `import/first` (tests legitimately reference hook names + hoist `jest.mock`) |

Path aliases mirror `tsconfig.json`: `@/*` → `src/*`, `@/assets/*` → `assets/*`.

### Global native mocks (`jest.setup.js`)

Provided once so hook/component/screen tests render without native modules; a test can still `jest.mock(...)` locally to override:

`react-native-reanimated`, `react-native-worklets`, `react-native-safe-area-context`, `@react-native-community/netinfo`, `expo-router` (router + hooks incl. `useIsFocused`), `@react-navigation/native`, `@react-native-firebase/app` + `/messaging`, `@notifee/react-native`, `react-native-vision-camera` (incl. `useCameraFormat`), `react-native-permissions` (incl. `checkNotifications`), `@gorhom/bottom-sheet`, `react-native-keyboard-controller` (incl. `KeyboardAvoidingView`/`KeyboardControllerView`), `expo-image-picker`, `expo-clipboard`, `expo-file-system` (+ `/legacy`), `expo-sharing`, `react-native-pdf`, `expo-constants`, `react-native-network-logger`.

## Coverage by area

| Area | Test files | What's covered |
| --- | --- | --- |
| `utils/`, `src/utils/` | 9 | promo engine, order-item grouping, currency, dates, helpers, API error mapping |
| `src/services/` | 9 | all 9 service domains — success (returned slice + client/URL/params) and failure (real `getApiErrorMessage` mapping); 200/201, abort signals, param builders, cached-service upsert + offline fallback |
| `src/storage/` | 5 | **cart.cache offline sync-queue state machine** (pending/deleted/synced, tombstones, "local wins"), product cache, auth storage, secure store, keys |
| `src/stores/` | 14 | every Zustand store — actions + selectors (auth, cart×2, network, notification, bottomSheet, confirm, input, loading, toast, global, pendingRoute, permission, prePermission) |
| `src/hooks/` | 22 | data hooks (catalog, products, customers, history, orders, approvals, warehouse), controllers (cart, order-detail, katalog-detail, product-list, scan), access hooks (camera, notification), `useDebounce`, `useToast`, `useLoading`, `useLogin`, `usePushNotifications` |
| `src/notifications/` | 6 | route/tray resolvers, channels, topics, display, push wiring |
| `src/components/` | 31 | ui leaves + tiles + sheets + modals + forms + layout — render, press, store-driven state, expand/collapse |
| `src/app/` | 51 | **every route screen** — smoke render (mounts without crashing + one stable anchor) |

Test layout tiers (cheapest first): pure logic → stores/hooks → component render → screen smoke.

## Conventions & gotchas

Follow the nearest existing test for the area. Non-obvious rules learned building this harness:

- **`@testing-library/react-native` v14 `render`, `renderHook`, `rerender`, and `fireEvent.*` are ASYNC — `await` them.** Missing an `await` on `renderHook` gives `result.current === undefined`. Timer advances go in `await act(async () => { jest.advanceTimersByTime(n) })`.
- **React 19 deferred commits:** after a state-changing `fireEvent.press`, use `await screen.findByText(...)`, not `getByText` — the commit is deferred.
- **`act` is for POST-render mutations only.** Wrapping a *pre-render* `useStore.setState(...)` (e.g. in `beforeEach`) inside `act(...)` can make the component render an empty tree. Seed stores with a plain `setState` before render.
- **`jest.mock` factories: define `jest.fn()`s inline, then import the mocked module and cast** (`const m = svc.foo as jest.Mock`). Referencing outer `const` vars from the factory throws "not allowed to reference out-of-scope variables". `jest.mock` hoists above imports, so a local mock precedes the `import` of the module under test.
- **reanimated 4:** never use `react-native-reanimated/mock` (loads real worklets native → crash). Use the hand-stub in `__mocks__/`.
- **`moduleNameMapper` is first-match-wins:** `\.svg$` / `\.css$` must precede `^@/assets` and `^@/`, else `@/assets/x.svg` / `@/global.css` resolve to real (untransformable) files.
- **`transformIgnorePatterns`:** mirror jest-expo's default bare-prefix form; only `@notifee` needs adding.
- **Screen tests** mock mount-time data hooks/services locally to a safe empty/loading state so the render is deterministic and network-free; `[id]` screens locally override `expo-router`'s `useLocalSearchParams`.

## Known source issue surfaced by tests

- **`src/components/ui/ChatBubble.tsx` (and `TileChat.tsx`) are declared `async function`.** React 19 client components cannot be async (only RSC can) — rendering them with real message data throws "async Client Component". Chat-screen tests avoid this by rendering the empty state. **Fix: remove the `async` keyword** (there is no `await` in the body). Not changed here (out of test scope).

## Not yet covered

- Screen tests are **smoke-level** (renders without crashing). Deeper per-screen interaction/flow assertions can be layered on using the existing smoke tests + `expo-router/testing-library` `renderRouter` as the base. The composed hooks/services/components each screen uses are already unit-tested.
- `src/constants/version.ts` version-compare helpers (distinct from `utils/version.ts`).
