import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import theme from '../constants/theme';

/**
 * Shared metric typography for Practice and the result screen.
 * Zero values stay in a descriptive row — never an orphaned statistic pill.
 */
export default function MetricRow({
  label,
  value,
  supportingText,
  accent,
  last,
}: {
  label: string;
  value: string;
  supportingText?: string;
  accent?: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.row, last ? styles.rowLast : null]}>
      <View style={styles.left}>
        <Text style={styles.label} numberOfLines={1}>
          {label}
        </Text>
        {supportingText ? (
          <Text style={styles.support} numberOfLines={2}>
            {supportingText}
          </Text>
        ) : null}
      </View>
      <Text
        style={[styles.value, { color: accent || theme.colors.textPrimary }]}
        numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.alpha.hairline,
  },
  rowLast: { borderBottomWidth: 0 },
  left: { flex: 1, minWidth: 0 },
  label: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  support: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  value: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
});
