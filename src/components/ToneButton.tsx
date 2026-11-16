import React from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import theme from '../constants/theme';
import { HIT_SLOP, usePressScale } from './PressScale';

interface ToneButtonProps {
  stringNumber: number;
  note: string;
  octave: number;
  frequency: number;
  playing: boolean;
  width: number;
  onPress: () => void;
}

export default function ToneButton({
  stringNumber,
  note,
  octave,
  frequency,
  playing,
  width,
  onPress,
}: ToneButtonProps) {
  const { scale, onPressIn, onPressOut } = usePressScale(0.97);

  return (
    <Pressable
      style={{ width, height: 92 }}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      hitSlop={HIT_SLOP}
      accessibilityRole="button"
      accessibilityState={{ selected: playing }}
      accessibilityLabel={
        'String ' + stringNumber + ', ' + note + octave + ', ' + frequency.toFixed(2) + ' hertz'
      }>
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.card,
          theme.shadow.card,
          {
            transform: [{ scale }],
            borderColor: playing ? theme.colors.accent : theme.colors.secondary,
            borderWidth: playing ? 2 : 1,
            backgroundColor: playing ? theme.alpha.accentWash : theme.colors.surface,
          },
        ]}>
        <View style={styles.topRow}>
          <Text style={styles.stringNo}>{'String ' + stringNumber}</Text>
          {playing ? <Text style={styles.playing}>Playing</Text> : null}
        </View>
        <Text style={styles.note}>{note + octave}</Text>
        <Text style={styles.freq}>{frequency.toFixed(2) + ' Hz'}</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    height: 92,
    borderRadius: theme.radius.card,
    paddingHorizontal: 14,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stringNo: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    color: theme.colors.textMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  playing: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    color: theme.colors.accent,
  },
  note: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  freq: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    fontVariant: ['tabular-nums'],
  },
});
