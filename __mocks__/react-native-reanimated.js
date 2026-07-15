// Manual mock for react-native-reanimated v4. The library's own `mock` entry
// pulls the real index → react-native-worklets, which throws headless
// ("Native part of Worklets doesn't seem to be initialized"). This stub
// implements only the surface the app's components use, with worklets as plain
// synchronous JS so animated components render as their host equivalents.
const React = require('react');
const RN = require('react-native');

const useSharedValue = (init) => ({ value: init });
const useAnimatedStyle = (fn) => {
  try {
    return fn();
  } catch {
    return {};
  }
};
const useDerivedValue = (fn) => ({ value: (() => { try { return fn(); } catch { return undefined; } })() });
const identity = (v) => v;
const createAnimatedComponent = (Component) => Component;
const runOnJS = (fn) => fn;
const runOnUI = (fn) => fn;

const Animated = {
  View: RN.View,
  Text: RN.Text,
  ScrollView: RN.ScrollView,
  Image: RN.Image,
  FlatList: RN.FlatList,
  createAnimatedComponent,
};

const Easing = {
  linear: (t) => t,
  ease: (t) => t,
  in: () => (t) => t,
  out: () => (t) => t,
  inOut: () => (t) => t,
  bezier: () => (t) => t,
};

module.exports = {
  __esModule: true,
  default: Animated,
  ...Animated,
  useSharedValue,
  useAnimatedStyle,
  useDerivedValue,
  useAnimatedScrollHandler: () => () => {},
  useAnimatedRef: () => ({ current: null }),
  withTiming: identity,
  withSpring: identity,
  withDelay: (_delay, v) => v,
  withRepeat: identity,
  withSequence: (...args) => args[args.length - 1],
  cancelAnimation: () => {},
  interpolate: (v) => v,
  Extrapolation: { CLAMP: 'clamp', EXTEND: 'extend', IDENTITY: 'identity' },
  runOnJS,
  runOnUI,
  createAnimatedComponent,
  Easing,
  FadeIn: {},
  FadeOut: {},
  Layout: {},
};
