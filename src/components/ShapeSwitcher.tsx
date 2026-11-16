import React from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import theme from '../constants/theme';
import { HIT_SLOP, usePressScale } from './PressScale';

function Arrow({
  dir,
  label,
  disabled,
  onPress,
}: {
  dir: 'prev' | 'next';
  label: string;
  disabled: boolean;
  onPress: () => void;
}) {
  const { scale, onPressIn, onPressOut } = usePressScale(0.92);
  const Icon = dir === 'prev' ? ChevronLeft : ChevronRight;

  return (
    <Pressable
      style={styles.press}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={disabled}
      hitSlop={HIT_SLOP}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityLabel={label}>
      <Animated.View
        pointerEvents="box-none"
        style={[styles.inner, { transform: [{ scale }], opacity: disabled ? 0.45 : 1 }]}>
        <Icon size={24} color={theme.colors.textPrimary} strokeWidth={2.4} />
      </Animated.View>
    </Pressable>
  );
}

export default function ShapeSwitcher({
  index,
  count,
  positionLabel,
  difficulty,
  onPrevious,
  onNext,
}: {
  index: number;
  count: number;
  positionLabel: string;
  difficulty: string;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <View style={styles.row}>
      <Arrow dir="prev" label="Previous shape" disabled={index <= 0} onPress={onPrevious} />

      <View style={styles.center}>
        <Text style={styles.title} numberOfLines={1}>
          {'Shape ' + (index + 1) + ' of ' + count}
        </Text>
        <Text style={styles.sub} numberOfLines={1}>
          {positionLabel + ' · ' + difficulty}
        </Text>
      </View>

      <Arrow dir="next" label="Next shape" disabled={index >= count - 1} onPress={onNext} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  press: { width: 48, height: 48 },
  inner: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.tile,
    borderWidth: 1,
    borderColor: theme.colors.secondary,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: { flex: 1, minWidth: 0, alignItems: 'center' },
  title: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  sub: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    color: theme.colors.textMuted,
  },
});
