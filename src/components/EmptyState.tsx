import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, Text, View } from 'react-native';
import theme from '../constants/theme';
import { PrimaryButton, SecondaryButton } from './Buttons';

interface EmptyStateProps {
  illustration: ImageSourcePropType;
  title: string;
  body: string;
  primaryLabel?: string;
  onPrimary?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
}

export default function EmptyState({
  illustration,
  title,
  body,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
}: EmptyStateProps) {
  return (
    <View style={styles.root}>
      <Image source={illustration} style={styles.art} resizeMode="contain" />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>

      {primaryLabel && onPrimary ? (
        <View style={styles.primaryWrap}>
          <PrimaryButton label={primaryLabel} onPress={onPrimary} />
        </View>
      ) : null}

      {secondaryLabel && onSecondary ? (
        <View style={styles.secondaryWrap}>
          <SecondaryButton label={secondaryLabel} onPress={onSecondary} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', paddingHorizontal: 8 },
  art: { width: 80, height: 80, marginBottom: 12 },
  title: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  body: {
    fontSize: 16,
    lineHeight: 23,
    fontWeight: '400',
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
  },
  primaryWrap: { width: '100%', marginTop: 18 },
  secondaryWrap: { marginTop: 10 },
});
