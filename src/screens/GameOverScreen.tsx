import React, { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';
import { Check, Home, Timer } from 'lucide-react-native';
import assets from '../assets';
import { PrimaryButton, SecondaryButton } from '../components/Buttons';
import MaterialBackground from '../components/MaterialBackground';
import MaterialCard from '../components/MaterialCard';
import MetricRow from '../components/MetricRow';
import ScreenHeader from '../components/ScreenHeader';
import theme from '../constants/theme';
import { completionPercent, formatClock } from '../game/practiceEngine';
import type { PracticeSummary } from '../game/types';
import { CONTENT_W, SIDE_MARGIN } from '../utils/layout';

export default function GameOverScreen({
  summary,
  onPracticeAgain,
  onBackToFinder,
}: {
  summary: PracticeSummary;
  onPracticeAgain: () => void;
  onBackToFinder: () => void;
}) {
  const enter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    enter.setValue(0);
    Animated.timing(enter, {
      toValue: 1,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [enter, summary.sessionId]);

  const scale = enter.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] });
  const percent = completionPercent(summary.completed, summary.opportunities);

  return (
    <MaterialBackground variant="result">
      <ScreenHeader
        title={summary.reason === 'elapsed' ? 'Practice complete' : 'Session finished'}
        caption="Time practiced and the changes you marked."
      />

      <View style={styles.body}>
        <View style={styles.center}>
          <Animated.View
            pointerEvents="none"
            style={[styles.medallion, { opacity: enter, transform: [{ scale }] }]}>
            <Check size={40} color={theme.colors.white} strokeWidth={3} />
          </Animated.View>

          <Text style={styles.headline} accessibilityRole="header">
            Nice work showing up.
          </Text>

          <View style={styles.chipRow}>
            {summary.chordNames.map((n, i) => (
              <View key={n + '-' + i} style={styles.chip}>
                <Text style={styles.chipText}>{n}</Text>
              </View>
            ))}
          </View>
        </View>

        <Animated.View pointerEvents="box-none" style={{ opacity: enter }}>
          <MaterialCard material="paper" padding={16}>
            <View style={styles.cardHead}>
              <Text style={styles.cardTitle}>Session summary</Text>
              <Image source={assets.sprite5} style={styles.cardArt} resizeMode="contain" />
            </View>

            <MetricRow label="Active time" value={formatClock(summary.activeSec * 1000)} />
            <MetricRow label="Tempo" value={summary.bpm + ' BPM'} />
            <MetricRow
              label="Changes marked"
              value={summary.completed + ' of ' + summary.opportunities}
              supportingText="Self-reported taps, not a listening score."
              accent={theme.colors.primary}
              last={percent === null}
            />
            {percent === null ? null : (
              <MetricRow
                label="Completion"
                value={percent + '%'}
                accent={theme.colors.accent}
                last
              />
            )}

            {summary.opportunities === 0 ? (
              <Text style={styles.honest}>No changes marked yet.</Text>
            ) : null}
          </MaterialCard>
        </Animated.View>
      </View>

      <View style={styles.panel}>
        <PrimaryButton label="PRACTICE AGAIN" Icon={Timer} onPress={onPracticeAgain} />
        <View style={styles.secondaryWrap}>
          <SecondaryButton label="Back to Finder" Icon={Home} onPress={onBackToFinder} />
        </View>
        <Text style={styles.saveLine}>Saved to this device.</Text>
      </View>
    </MaterialBackground>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    paddingHorizontal: SIDE_MARGIN,
    width: CONTENT_W + 2 * SIDE_MARGIN,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  center: { alignItems: 'center', marginBottom: 18 },
  medallion: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadow.card,
  },
  headline: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginTop: 12,
    textAlign: 'center',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginTop: 12,
  },
  chip: {
    height: 32,
    minWidth: 50,
    paddingHorizontal: 12,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  cardTitle: {
    flex: 1,
    minWidth: 0,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  cardArt: { width: 40, height: 40 },
  honest: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    color: theme.colors.textMuted,
    marginTop: 10,
  },
  panel: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.radius.panel,
    borderTopRightRadius: theme.radius.panel,
    borderTopWidth: 1,
    borderColor: theme.colors.secondary,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    ...theme.shadow.panel,
  },
  secondaryWrap: { marginTop: 10, alignItems: 'center' },
  saveLine: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
  },
});
