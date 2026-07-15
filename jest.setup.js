// Native-module mocks for the hook/component tiers. Loaded via
// jest.config.js `setupFilesAfterEnv`. Pure-logic tests don't hit any of these
// (they mock their own deps locally), so keeping these here is harmless to them.

/* eslint-disable @typescript-eslint/no-require-imports */

// Reanimated: the library's own `mock` pulls the real worklets native and
// throws headless, so use our hand-stub in __mocks__/react-native-reanimated.js
// (jest auto-resolves manual mocks for node_modules on an explicit jest.mock).
jest.mock('react-native-reanimated');

// Safe-area insets → zeros; providers render children straight through.
jest.mock('react-native-safe-area-context', () => {
  const insets = { top: 0, right: 0, bottom: 0, left: 0 };
  const frame = { x: 0, y: 0, width: 390, height: 844 };
  const passthrough = ({ children }) => children;
  return {
    SafeAreaProvider: passthrough,
    SafeAreaView: passthrough,
    useSafeAreaInsets: () => insets,
    useSafeAreaFrame: () => frame,
    SafeAreaInsetsContext: {
      Consumer: ({ children }) => children(insets),
      Provider: passthrough,
    },
    initialWindowMetrics: { insets, frame },
  };
});

// NetInfo: addEventListener returns an unsubscribe, fetch resolves a stub state.
jest.mock('@react-native-community/netinfo', () =>
  require('@react-native-community/netinfo/jest/netinfo-mock.js')
);

// ===== Global native mocks for the hook/component tiers =====
// Let hook/component tests render/import without native modules. Each mock
// exposes module-level jest.fn()s so a test can `import` the module and assert.
// A test that needs different behavior can still `jest.mock(...)` locally (a
// file-local mock overrides these).

// expo-constants: provide expoConfig.extra so @/constants/API can load.
jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    expoConfig: { extra: { BEARER_UAT: 'Bearer', BEARER_PRD: 'Bearer' } },
    manifest: {},
  },
}));

// react-native-network-logger (imported by @/constants/API).
jest.mock('react-native-network-logger', () => ({
  __esModule: true,
  default: () => null,
  startNetworkLogging: jest.fn(),
}));

jest.mock('expo-router', () => {
  const router = {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: jest.fn(() => true),
    navigate: jest.fn(),
    setParams: jest.fn(),
    dismiss: jest.fn(),
    dismissAll: jest.fn(),
  };
  const passthrough = ({ children }) => children ?? null;
  return {
    __esModule: true,
    router,
    useRouter: () => router,
    useLocalSearchParams: () => ({}),
    useGlobalSearchParams: () => ({}),
    useSegments: () => [],
    usePathname: () => '/',
    useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn(), setOptions: jest.fn() }),
    useFocusEffect: () => {},
    useIsFocused: () => true, // some screens import this from expo-router
    Link: passthrough,
    Redirect: () => null,
    Slot: passthrough,
    Stack: Object.assign(passthrough, { Screen: () => null }),
    Tabs: Object.assign(passthrough, { Screen: () => null }),
  };
});

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useIsFocused: () => true,
    useFocusEffect: () => {},
    useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn(), setOptions: jest.fn() }),
  };
});

jest.mock('@react-native-firebase/app', () => ({
  __esModule: true,
  getApp: jest.fn(() => ({})),
}));
jest.mock('@react-native-firebase/messaging', () => ({
  __esModule: true,
  getMessaging: jest.fn(() => ({})),
  getToken: jest.fn(async () => 'fcm-token'),
  onMessage: jest.fn(() => () => {}),
  onNotificationOpenedApp: jest.fn(() => () => {}),
  onTokenRefresh: jest.fn(() => () => {}),
  getInitialNotification: jest.fn(async () => null),
  requestPermission: jest.fn(async () => 1),
  subscribeToTopic: jest.fn(async () => {}),
  unsubscribeFromTopic: jest.fn(async () => {}),
  AuthorizationStatus: { AUTHORIZED: 1, PROVISIONAL: 2, DENIED: 0 },
}));

jest.mock('@notifee/react-native', () => ({
  __esModule: true,
  default: {
    createChannel: jest.fn(async () => 'channel-id'),
    displayNotification: jest.fn(async () => {}),
    cancelNotification: jest.fn(async () => {}),
    cancelAllNotifications: jest.fn(async () => {}),
    cancelDisplayedNotification: jest.fn(async () => {}),
    getDisplayedNotifications: jest.fn(async () => []),
    setBadgeCount: jest.fn(async () => {}),
    getInitialNotification: jest.fn(async () => null),
    onForegroundEvent: jest.fn(() => () => {}),
    onBackgroundEvent: jest.fn(),
    requestPermission: jest.fn(async () => ({ authorizationStatus: 1 })),
  },
  EventType: { DISMISSED: 0, PRESS: 1, ACTION_PRESS: 2, DELIVERED: 3 },
  AndroidImportance: { DEFAULT: 3, HIGH: 4, LOW: 2 },
  AuthorizationStatus: { AUTHORIZED: 1, DENIED: 0, PROVISIONAL: 2 },
}));

jest.mock('react-native-vision-camera', () => {
  const R = require('react');
  return {
    __esModule: true,
    Camera: (props) => R.createElement('Camera', props),
    useCameraDevice: () => ({ id: 'back' }),
    useCameraDevices: () => ({ back: { id: 'back' } }),
    useCameraFormat: () => ({}),
    useCameraPermission: () => ({ hasPermission: true, requestPermission: jest.fn(async () => true) }),
    useCodeScanner: (cfg) => cfg,
  };
});

jest.mock('react-native-permissions', () => ({
  __esModule: true,
  check: jest.fn(async () => 'granted'),
  request: jest.fn(async () => 'granted'),
  checkNotifications: jest.fn(async () => ({ status: 'granted', settings: {} })),
  requestNotifications: jest.fn(async () => ({ status: 'granted', settings: {} })),
  openSettings: jest.fn(async () => {}),
  RESULTS: { UNAVAILABLE: 'unavailable', DENIED: 'denied', LIMITED: 'limited', GRANTED: 'granted', BLOCKED: 'blocked' },
  PERMISSIONS: { IOS: {}, ANDROID: {} },
}));

jest.mock('@gorhom/bottom-sheet', () => {
  const R = require('react');
  const pass = ({ children }) => children ?? null;
  const fwd = R.forwardRef((props, _ref) => props.children ?? null);
  return {
    __esModule: true,
    default: fwd,
    BottomSheetModal: fwd,
    BottomSheetModalProvider: pass,
    BottomSheetView: pass,
    BottomSheetScrollView: pass,
    BottomSheetFlatList: pass,
    BottomSheetBackdrop: () => null,
    BottomSheetTextInput: (props) => R.createElement('TextInput', props),
    useBottomSheetModal: () => ({ dismiss: jest.fn(), dismissAll: jest.fn() }),
  };
});

jest.mock('expo-image-picker', () => ({
  __esModule: true,
  launchCameraAsync: jest.fn(async () => ({ canceled: true, assets: null })),
  launchImageLibraryAsync: jest.fn(async () => ({ canceled: true, assets: null })),
  requestCameraPermissionsAsync: jest.fn(async () => ({ granted: true })),
  requestMediaLibraryPermissionsAsync: jest.fn(async () => ({ granted: true })),
  MediaTypeOptions: { Images: 'Images' },
}));
jest.mock('expo-clipboard', () => ({
  __esModule: true,
  setStringAsync: jest.fn(async () => {}),
  getStringAsync: jest.fn(async () => ''),
}));
jest.mock('expo-file-system', () => ({
  __esModule: true,
  documentDirectory: 'file:///doc/',
  cacheDirectory: 'file:///cache/',
  writeAsStringAsync: jest.fn(async () => {}),
  readAsStringAsync: jest.fn(async () => ''),
  deleteAsync: jest.fn(async () => {}),
  getInfoAsync: jest.fn(async () => ({ exists: false })),
  EncodingType: { Base64: 'base64', UTF8: 'utf8' },
}));
jest.mock('expo-sharing', () => ({
  __esModule: true,
  isAvailableAsync: jest.fn(async () => true),
  shareAsync: jest.fn(async () => {}),
}));
jest.mock('react-native-pdf', () => {
  const R = require('react');
  return { __esModule: true, default: (props) => R.createElement('Pdf', props) };
});
jest.mock('react-native-keyboard-controller', () => ({
  __esModule: true,
  KeyboardProvider: ({ children }) => children ?? null,
  KeyboardAwareScrollView: ({ children }) => children ?? null,
  KeyboardAvoidingView: ({ children }) => children ?? null,
  KeyboardControllerView: ({ children }) => children ?? null,
  KeyboardStickyView: ({ children }) => children ?? null,
  KeyboardController: { dismiss: jest.fn() },
  useKeyboardHandler: () => {},
  useReanimatedKeyboardAnimation: () => ({ height: { value: 0 }, progress: { value: 0 } }),
}));

// expo-file-system/legacy subpath (manual-book imports it).
jest.mock('expo-file-system/legacy', () => ({
  __esModule: true,
  documentDirectory: 'file:///doc/',
  cacheDirectory: 'file:///cache/',
  writeAsStringAsync: jest.fn(async () => {}),
  readAsStringAsync: jest.fn(async () => ''),
  deleteAsync: jest.fn(async () => {}),
  getInfoAsync: jest.fn(async () => ({ exists: false })),
  downloadAsync: jest.fn(async () => ({ uri: 'file:///doc/x.pdf' })),
  EncodingType: { Base64: 'base64', UTF8: 'utf8' },
}));

// react-native-worklets: Toast.tsx (re-exported via components/ui) imports
// `scheduleOnRN`; the real module throws headless. Run callbacks synchronously.
jest.mock('react-native-worklets', () => ({
  __esModule: true,
  scheduleOnRN: (fn, ...args) => fn?.(...args),
  runOnJS: (fn) => fn,
  runOnUI: (fn) => fn,
}));

// ===== Console noise control =====

// Silence the app's __DEV__-gated console.log. Services/hooks log on their error
// branches (products.services, useCatalog, display, useCustomerDetail, ...), and
// tests deliberately exercise those branches — the logs are expected, not
// failures. Muted only in the jest env; real __DEV__ runs are unaffected. A test
// that needs to assert on a log can still spy on console.log locally.
jest.spyOn(console, 'log').mockImplementation(() => {});

// Drop one specific, benign React-Native warning: VirtualizedList performs an
// internal deferred setState (post-mount cell measurement / scrollToEnd) on a
// timer. Under parallel jest workers that update can land just outside a test's
// act() window, so it appears flakily ("...not wrapped in act(...)") even though
// no app code is at fault (serial `--runInBand` never emits it). This filter is
// intentionally exact-match so genuine unwrapped-update warnings from app code
// (which name other components / different text) still surface.
const realConsoleError = console.error.bind(console);
jest.spyOn(console, 'error').mockImplementation((...args) => {
  // React formats this as "An update to %s inside a test was not wrapped in
  // act(...)" with the component name ("VirtualizedList") as a separate arg.
  const first = args[0];
  if (
    typeof first === 'string' &&
    first.includes('inside a test was not wrapped in act') &&
    args.some((a) => String(a).includes('VirtualizedList'))
  ) {
    return;
  }
  realConsoleError(...args);
});
