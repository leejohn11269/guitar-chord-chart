/**
 * react-test-renderer has no native view tree, so the native-driver bridge
 * cannot attach. Only the bridge is mocked — the Animated API stays real.
 */
jest.mock('react-native/src/private/animated/NativeAnimatedHelper');
