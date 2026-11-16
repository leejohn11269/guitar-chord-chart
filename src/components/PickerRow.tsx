import React from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react-native';
import theme from '../constants/theme';
import { HIT_SLOP, usePressScale } from './PressScale';

function Stepper({
  dir,
  label,
  onPress,
}: {
  dir: 'prev' | 'next';
  label: string;
  onPress: () => void;
}) {
  const { scale, onPressIn, onPressOut } = usePressScale(0.92);
  const Icon = dir === 'prev' ? ChevronLeft : ChevronRight;

  return (
    <Pressable
      style={styles.stepPress}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      hitSlop={HIT_SLOP}
      accessibilityRole="button"
      accessibilityLabel={label}>
      <Animated.View pointerEvents="box-none" style={[styles.stepInner, { transform: [{ scale }] }]}>
        <Icon size={24} color={theme.colors.textPrimary} strokeWidth={2.4} />
      </Animated.View>
    </Pressable>
  );
}

interface RootPickerProps {
  value: string;
  onPrev: () => void;
  onNext: () => void;
  onOpenGrid: () => void;
}

export function RootPicker({ value, onPrev, onNext, onOpenGrid }: RootPickerProps) {
  const { scale, onPressIn, onPressOut } = usePressScale(0.97);

  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>Key</Text>
      <View style={styles.rowControls}>
        <Stepper dir="prev" label="Previous key" onPress={onPrev} />
        <Pressable
          style={styles.valuePress}
          onPress={onOpenGrid}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          hitSlop={HIT_SLOP}
          accessibilityRole="button"
          accessibilityLabel={'Key ' + value + '. Open key list.'}>
          <Animated.View
            pointerEvents="box-none"
            style={[styles.valueInner, { transform: [{ scale }] }]}>
            <Text style={styles.valueText} numberOfLines={1}>
              {value}
            </Text>
          </Animated.View>
        </Pressable>
        <Stepper dir="next" label="Next key" onPress={onNext} />
      </View>
    </View>
  );
}

interface TypePickerProps {
  value: string;
  onOpenGrid: () => void;
}

export function ChordTypePicker({ value, onOpenGrid }: TypePickerProps) {
  const { scale, onPressIn, onPressOut } = usePressScale(0.97);

  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>Type</Text>
      <Pressable
        style={styles.typePress}
        onPress={onOpenGrid}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        hitSlop={HIT_SLOP}
        accessibilityRole="button"
        accessibilityLabel={'Chord type ' + value + '. Open type list.'}>
        <Animated.View
          pointerEvents="box-none"
          style={[styles.typeInner, { transform: [{ scale }] }]}>
          <Text style={styles.valueText} numberOfLines={1}>
            {value}
          </Text>
          <ChevronDown size={24} color={theme.colors.textSecondary} strokeWidth={2.2} />
        </Animated.View>
      </Pressable>
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
  rowLabel: {
    width: 52,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  rowControls: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  stepPress: { width: 48, height: 48 },
  stepInner: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.tile,
    borderWidth: 1,
    borderColor: theme.colors.secondary,
    backgroundColor: theme.colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valuePress: { flex: 1, height: 48, minWidth: 0 },
  valueInner: {
    width: '100%',
    height: 48,
    borderRadius: theme.radius.tile,
    borderWidth: 1,
    borderColor: theme.colors.secondary,
    backgroundColor: theme.colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typePress: { flex: 1, height: 48, minWidth: 0 },
  typeInner: {
    width: '100%',
    height: 48,
    borderRadius: theme.radius.tile,
    borderWidth: 1,
    borderColor: theme.colors.secondary,
    backgroundColor: theme.colors.cream,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  valueText: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
});
