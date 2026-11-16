import React from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import theme from '../constants/theme';
import { HIT_SLOP, usePressScale } from './PressScale';

/** Any SVG icon component from the project's single icon library. */
export type IconComponent = React.ComponentType<any>;

/** Every button icon in this app is exactly 24x24 with a 24 line-height label. */
export const BUTTON_ICON = 24;

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  Icon?: IconComponent;
  disabled?: boolean;
  accessibilityLabel?: string;
  tone?: 'accent' | 'green';
}

export function PrimaryButton({
  label,
  onPress,
  Icon,
  disabled,
  accessibilityLabel,
  tone = 'accent',
}: PrimaryButtonProps) {
  const { scale, onPressIn, onPressOut } = usePressScale(0.98);
  const colors =
    tone === 'green'
      ? (theme.gradients.greenPanel as unknown as string[])
      : (theme.gradients.primaryButton as unknown as string[]);
  const textColor = tone === 'green' ? theme.colors.textPrimary : theme.colors.white;

  return (
    <Pressable
      style={styles.primaryPress}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={disabled}
      hitSlop={HIT_SLOP}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      accessibilityLabel={accessibilityLabel || label}>
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.primaryShell,
          theme.shadow.primary,
          { transform: [{ scale }], opacity: disabled ? 0.45 : 1 },
        ]}>
        <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.fill}>
          <View style={styles.topHighlight} pointerEvents="none" />
          <View style={styles.row}>
            {Icon ? <Icon size={BUTTON_ICON} color={textColor} strokeWidth={2.4} /> : null}
            <Text style={[styles.primaryLabel, { color: textColor }]} numberOfLines={1}>
              {label}
            </Text>
          </View>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

interface SecondaryButtonProps {
  label: string;
  onPress: () => void;
  Icon?: IconComponent;
  disabled?: boolean;
  selected?: boolean;
  accessibilityLabel?: string;
  flex?: boolean;
}

export function SecondaryButton({
  label,
  onPress,
  Icon,
  disabled,
  selected,
  accessibilityLabel,
  flex,
}: SecondaryButtonProps) {
  const { scale, onPressIn, onPressOut } = usePressScale(0.98);
  const tint = selected ? theme.colors.accent : theme.colors.textPrimary;

  return (
    <Pressable
      style={[styles.secondaryPress, flex ? styles.secondaryFlex : null]}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={disabled}
      hitSlop={HIT_SLOP}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled, selected: !!selected }}
      accessibilityLabel={accessibilityLabel || label}>
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.secondaryShell,
          {
            transform: [{ scale }],
            opacity: disabled ? 0.45 : 1,
            borderColor: selected ? theme.colors.accent : theme.colors.secondary,
            borderWidth: selected ? 2 : 1,
            backgroundColor: selected ? theme.alpha.accentWash : theme.colors.surface,
          },
          theme.shadow.card,
        ]}>
        <View style={styles.row}>
          {Icon ? <Icon size={BUTTON_ICON} color={tint} strokeWidth={2.2} /> : null}
          <Text style={[styles.secondaryLabel, { color: tint }]} numberOfLines={1}>
            {label}
          </Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

interface IconButtonProps {
  Icon: IconComponent;
  label: string;
  onPress: () => void;
  selected?: boolean;
  disabled?: boolean;
  tone?: 'light' | 'dark';
}

/** Fixed 48x48 target with a 24dp icon — used in every header. */
export function IconButton({ Icon, label, onPress, selected, disabled, tone = 'light' }: IconButtonProps) {
  const { scale, onPressIn, onPressOut } = usePressScale(0.94);
  const color = selected
    ? theme.colors.accent
    : tone === 'dark'
    ? theme.colors.white
    : theme.colors.textPrimary;

  return (
    <Pressable
      style={styles.iconPress}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={disabled}
      hitSlop={HIT_SLOP}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled, selected: !!selected }}
      accessibilityLabel={label}>
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.iconShell,
          {
            transform: [{ scale }],
            opacity: disabled ? 0.45 : 1,
            backgroundColor: selected ? theme.alpha.accentWash : theme.colors.surface,
            borderColor: selected ? theme.colors.accent : theme.colors.secondary,
          },
        ]}>
        <Icon size={BUTTON_ICON} color={color} strokeWidth={2.2} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  primaryPress: { width: '100%', height: 56 },
  primaryShell: {
    width: '100%',
    height: 56,
    borderRadius: theme.radius.card,
    overflow: 'hidden',
  },
  fill: {
    width: '100%',
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 14,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  primaryLabel: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  secondaryPress: { height: 48, minWidth: 120 },
  secondaryFlex: { flex: 1, minWidth: 0 },
  secondaryShell: {
    width: '100%',
    height: 48,
    borderRadius: theme.radius.card,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  secondaryLabel: {
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '700',
  },
  iconPress: { width: 48, height: 48 },
  iconShell: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.tile,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
