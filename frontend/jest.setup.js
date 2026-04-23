/* eslint-disable */
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// Reanimated 4 + Worklets: stub leve sem tocar o módulo nativo.
jest.mock('react-native-reanimated', () => {
  const View = require('react-native').View;
  const Text = require('react-native').Text;
  const ScrollView = require('react-native').ScrollView;
  return {
    __esModule: true,
    default: { createAnimatedComponent: (c) => c, call: () => {} },
    useSharedValue: (init) => ({ value: init }),
    useAnimatedStyle: (cb) => cb(),
    withTiming: (v) => v,
    withSpring: (v) => v,
    withDecay: (v) => v,
    runOnJS: (fn) => fn,
    runOnUI: (fn) => fn,
    Easing: { linear: () => {}, inOut: () => () => {}, ease: () => {} },
    View,
    Text,
    ScrollView,
    createAnimatedComponent: (c) => c,
  };
});

jest.mock('react-native-worklets', () => ({
  __esModule: true,
  runOnJS: (fn) => fn,
  runOnUI: (fn) => fn,
  useWorkletCallback: (fn) => fn,
}));

jest.mock('react-native-gesture-handler', () => ({}));
