import { useCallback, useRef } from 'react';
import { Animated } from 'react-native';

/**
 * Press feedback for Android release builds: the Pressable stays the PARENT and
 * drives this spring, the Animated.View lives inside it. Only transform/opacity
 * ever runs on the native driver.
 */
export function usePressScale(pressedScale: number = 0.98) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = useCallback(() => {
    Animated.spring(scale, {
      toValue: pressedScale,
      tension: 180,
      friction: 20,
      useNativeDriver: true,
    }).start();
  }, [pressedScale, scale]);

  const onPressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      tension: 180,
      friction: 20,
      useNativeDriver: true,
    }).start();
  }, [scale]);

  return { scale, onPressIn, onPressOut };
}

export const HIT_SLOP = { top: 8, bottom: 8, left: 8, right: 8 };
