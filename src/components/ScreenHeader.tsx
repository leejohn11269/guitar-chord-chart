import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { HEADER_H, TOP_PAD } from '../constants/config';
import theme from '../constants/theme';

interface ScreenHeaderProps {
  title: string;
  caption?: string;
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
  centerSub?: string;
  tone?: 'light' | 'dark';
}

/**
 * The single header used by every screen. Screens differ through their slots,
 * never through re-declared header markup.
 */
export default function ScreenHeader({
  title,
  caption,
  leftSlot,
  rightSlot,
  centerSub,
  tone = 'light',
}: ScreenHeaderProps) {
  const titleColor = tone === 'dark' ? theme.colors.white : theme.colors.textPrimary;
  const captionColor = tone === 'dark' ? theme.colors.secondary : theme.colors.textMuted;

  return (
    <View
      style={[
        styles.root,
        tone === 'dark' ? styles.rootDark : styles.rootLight,
      ]}>
      <View style={styles.row}>
        <View style={styles.side}>{leftSlot ? leftSlot : null}</View>

        <View style={styles.center}>
          <Text style={[styles.title, { color: titleColor }]} numberOfLines={1}>
            {title}
          </Text>
          {centerSub ? (
            <Text style={[styles.centerSub, { color: captionColor }]} numberOfLines={1}>
              {centerSub}
            </Text>
          ) : null}
        </View>

        <View style={styles.side}>{rightSlot ? rightSlot : null}</View>
      </View>

      {caption ? (
        <Text style={[styles.caption, { color: captionColor }]} numberOfLines={1}>
          {caption}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingTop: TOP_PAD,
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  rootLight: {
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderBottomColor: 'rgba(24,36,24,0.10)',
  },
  rootDark: {
    backgroundColor: 'rgba(0,0,0,0.30)',
    borderBottomColor: 'rgba(255,255,255,0.12)',
  },
  row: {
    minHeight: HEADER_H - 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  side: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  center: { flex: 1, minWidth: 0, alignItems: 'center' },
  title: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '700',
    textAlign: 'center',
  },
  centerSub: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    textAlign: 'center',
  },
  caption: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 2,
  },
});
