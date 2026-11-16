import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, Switch, Text, View } from 'react-native';
import { Square } from 'lucide-react-native';
import assets from '../assets';
import { PrimaryButton } from '../components/Buttons';
import MaterialBackground from '../components/MaterialBackground';
import MaterialCard from '../components/MaterialCard';
import ScreenHeader from '../components/ScreenHeader';
import ToneButton from '../components/ToneButton';
import { TONE_MS } from '../constants/config';
import theme from '../constants/theme';
import { CONTENT_W, SIDE_MARGIN } from '../utils/layout';

interface ToneDef {
  stringNumber: number;
  note: string;
  octave: number;
  frequency: number;
}

/** Standard tuning, A4 = 440 Hz, twelve-tone equal temperament. */
const TONES: ToneDef[] = [
  { stringNumber: 6, note: 'E', octave: 2, frequency: 82.41 },
  { stringNumber: 5, note: 'A', octave: 2, frequency: 110.0 },
  { stringNumber: 4, note: 'D', octave: 3, frequency: 146.83 },
  { stringNumber: 3, note: 'G', octave: 3, frequency: 196.0 },
  { stringNumber: 2, note: 'B', octave: 3, frequency: 246.94 },
  { stringNumber: 1, note: 'E', octave: 4, frequency: 329.63 },
];

export default function TunerReferenceScreen({
  leftHanded,
  tabs,
}: {
  leftHanded: boolean;
  tabs: React.ReactNode;
}) {
  const [activeString, setActiveString] = useState<number | null>(null);
  const [repeat, setRepeat] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const repeatRef = useRef(repeat);
  repeatRef.current = repeat;

  const clearTimer = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    clearTimer();
    setActiveString(null);
  }, [clearTimer]);

  const schedule = useCallback(
    (stringNumber: number) => {
      clearTimer();
      timer.current = setTimeout(() => {
        if (repeatRef.current) {
          timer.current = setTimeout(() => schedule(stringNumber), 250);
        } else {
          setActiveString(null);
        }
      }, TONE_MS);
    },
    [clearTimer],
  );

  const press = (stringNumber: number) => {
    if (activeString === stringNumber) {
      stop();
      return;
    }
    setActiveString(stringNumber);
    schedule(stringNumber);
  };

  useEffect(() => clearTimer, [clearTimer]);

  const colWidth = Math.floor((CONTENT_W - 12) / 2);
  const ordered = leftHanded ? TONES.slice().reverse() : TONES;

  return (
    <MaterialBackground variant="tones">
      <ScreenHeader title="Tuner Reference" caption="Match each string by ear." />

      <View style={styles.body}>
        <MaterialCard material="wood" padding={14} radius={theme.radius.panel}>
          <View style={styles.panelRow}>
            <Image source={assets.sprite3} style={styles.sprite} resizeMode="contain" />
            <View style={styles.panelText}>
              <Text style={styles.panelTitle}>Standard tuning</Text>
              <Text style={styles.panelSub}>
                E A D G B E, A4 = 440 Hz. Tap a string to hold its reference tone.
              </Text>
            </View>
          </View>
        </MaterialCard>

        <View style={styles.grid}>
          {ordered.map(t => (
            <ToneButton
              key={t.stringNumber}
              stringNumber={t.stringNumber}
              note={t.note}
              octave={t.octave}
              frequency={t.frequency}
              playing={activeString === t.stringNumber}
              width={colWidth}
              onPress={() => press(t.stringNumber)}
            />
          ))}
        </View>
      </View>

      <View style={styles.panel}>
        <View style={styles.switchRow}>
          <View style={styles.switchText}>
            <Text style={styles.switchLabel}>Repeat tone</Text>
            <Text style={styles.switchSub}>Replay the 2 second tone until you stop it.</Text>
          </View>
          <Switch
            value={repeat}
            onValueChange={setRepeat}
            trackColor={{ false: theme.colors.secondary, true: theme.colors.primary }}
            thumbColor={theme.colors.surface}
            accessibilityLabel="Repeat tone"
          />
        </View>

        <PrimaryButton
          label="STOP TONE"
          Icon={Square}
          onPress={stop}
          disabled={activeString === null}
        />
      </View>

      {tabs}
    </MaterialBackground>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    paddingHorizontal: SIDE_MARGIN,
    width: CONTENT_W + 2 * SIDE_MARGIN,
    alignSelf: 'center',
    paddingTop: 12,
  },
  panelRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sprite: { width: 56, height: 56 },
  panelText: { flex: 1, minWidth: 0 },
  panelTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    color: '#F7F1E4',
  },
  panelSub: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    color: 'rgba(247,241,228,0.82)',
    marginTop: 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 14,
    justifyContent: 'space-between',
  },
  panel: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.radius.panel,
    borderTopRightRadius: theme.radius.panel,
    borderTopWidth: 1,
    borderColor: theme.colors.secondary,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 14,
    ...theme.shadow.panel,
  },
  switchRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 8,
  },
  switchText: { flex: 1, minWidth: 0 },
  switchLabel: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  switchSub: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    color: theme.colors.textMuted,
  },
});
