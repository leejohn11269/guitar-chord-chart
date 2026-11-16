import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';
import { TOAST_MS } from '../constants/config';
import theme from '../constants/theme';
import { HIT_SLOP } from './PressScale';

export default function Snackbar({
  message,
  actionLabel,
  onAction,
  onDismiss,
  visibleMs = TOAST_MS,
}: {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss: () => void;
  visibleMs?: number;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const dismiss = useRef(onDismiss);
  dismiss.current = onDismiss;

  useEffect(() => {
    opacity.setValue(0);
    Animated.timing(opacity, {
      toValue: 1,
      duration: 180,
      useNativeDriver: true,
    }).start();
    const t = setTimeout(() => dismiss.current(), visibleMs);
    return () => clearTimeout(t);
  }, [message, opacity, visibleMs]);

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[styles.root, theme.shadow.panel, { opacity }]}
      accessibilityLiveRegion="polite">
      <Text style={styles.text} numberOfLines={2}>
        {message}
      </Text>
      {actionLabel && onAction ? (
        <Pressable
          style={styles.actionPress}
          onPress={onAction}
          hitSlop={HIT_SLOP}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}>
          <Text style={styles.action}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    backgroundColor: theme.colors.textPrimary,
    borderRadius: theme.radius.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  text: {
    flex: 1,
    minWidth: 0,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    color: theme.colors.white,
  },
  actionPress: { width: 72, height: 44, alignItems: 'flex-end', justifyContent: 'center' },
  action: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    color: theme.colors.secondary,
  },
});
