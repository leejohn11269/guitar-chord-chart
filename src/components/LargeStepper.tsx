import React from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';
import theme from '../constants/theme';
import { HIT_SLOP, usePressScale } from './PressScale';

function StepButton({
  kind,
  label,
  disabled,
  onPress,
}: {
  kind: 'minus' | 'plus';
  label: string;
  disabled: boolean;
  onPress: () => void;
}) {
  const { scale, onPressIn, onPressOut } = usePressScale(0.92);
  const Icon = kind === 'minus' ? Minus : Plus;

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
        <Icon size={24} color={theme.colors.textPrimary} strokeWidth={2.6} />
      </Animated.View>
    </Pressable>
  );
}

export default function LargeStepper({
  label,
  value,
  min,
  max,
  step,
  formatValue,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  formatValue: (v: number) => string;
  onChange: (v: number) => void;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.labelWrap}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{formatValue(value)}</Text>
      </View>
      <View style={styles.controls}>
        <StepButton
          kind="minus"
          label={'Decrease ' + label}
          disabled={value <= min}
          onPress={() => onChange(Math.max(min, value - step))}
        />
        <StepButton
          kind="plus"
          label={'Increase ' + label}
          disabled={value >= max}
          onPress={() => onChange(Math.min(max, value + step))}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  labelWrap: { flex: 1, minWidth: 0 },
  label: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    color: theme.colors.textMuted,
  },
  value: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  press: { width: 48, height: 48 },
  inner: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.tile,
    borderWidth: 1,
    borderColor: theme.colors.secondary,
    backgroundColor: theme.colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
