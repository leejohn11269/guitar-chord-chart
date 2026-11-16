import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, Switch, Text, View } from 'react-native';
import { Check, ChevronLeft, Pause, Play, Timer } from 'lucide-react-native';
import assets from '../assets';
import { IconButton, PrimaryButton, SecondaryButton } from '../components/Buttons';
import FretboardDiagram from '../components/FretboardDiagram';
import MaterialBackground from '../components/MaterialBackground';
import MaterialCard from '../components/MaterialCard';
import ScreenHeader from '../components/ScreenHeader';
import {
  BEATS_PER_BLOCK,
  BPM_MAX,
  BPM_MIN,
  BPM_STEP,
  DURATION_CHOICES,
} from '../constants/config';
import LargeStepper from '../components/LargeStepper';
import theme from '../constants/theme';
import { chordName } from '../game/chordLibrary';
import {
  beatIntervalMs,
  blockMs,
  formatClock,
  opportunitiesFor,
} from '../game/practiceEngine';
import type { PracticeSetup, PracticeSummary } from '../game/types';
import { BOARD_W, CONTENT_W, SIDE_MARGIN } from '../utils/layout';

type Phase = 'idle' | 'countIn' | 'playing' | 'paused';

let sessionCounter = 0;

interface PracticeScreenProps {
  setup: PracticeSetup;
  leftHanded: boolean;
  onChangeSetup: (setup: PracticeSetup) => void;
  onFinish: (summary: PracticeSummary) => void;
  tabs: React.ReactNode;
}

export default function PracticeScreen({
  setup,
  leftHanded,
  onChangeSetup,
  onFinish,
  tabs,
}: PracticeScreenProps) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [activeMs, setActiveMs] = useState(0);
  const [countMs, setCountMs] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [markedBlock, setMarkedBlock] = useState(-1);

  const accumRef = useRef(0);
  const startRef = useRef(0);
  const completedRef = useRef(completed);
  completedRef.current = completed;
  const countStartRef = useRef(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const finishRef = useRef(onFinish);
  finishRef.current = onFinish;

  const chords = setup.voicings;
  const beat = beatIntervalMs(setup.bpm);
  const block = blockMs(setup.bpm);
  const durationMs = setup.durationSec * 1000;

  const clearTick = useCallback(() => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }, []);

  const finish = useCallback(
    (reason: 'elapsed' | 'finished', finalActiveMs: number, finalCompleted: number) => {
      clearTick();
      setPhase('idle');
      sessionCounter += 1;
      finishRef.current({
        sessionId: 'session-' + Date.now().toString(36) + '-' + sessionCounter,
        finishedAt: Date.now(),
        chordNames: chords.map(v => chordName(v.root, v.type)),
        bpm: setup.bpm,
        plannedSec: setup.durationSec,
        activeSec: Math.round(finalActiveMs / 1000),
        completed: finalCompleted,
        opportunities: opportunitiesFor(finalActiveMs, setup.bpm),
        reason,
      });
    },
    [chords, clearTick, setup.bpm, setup.durationSec],
  );

  useEffect(() => clearTick, [clearTick]);

  useEffect(() => {
    clearTick();
    if (phase === 'countIn') {
      countStartRef.current = Date.now();
      setCountMs(0);
      tickRef.current = setInterval(() => {
        const elapsed = Date.now() - countStartRef.current;
        if (elapsed >= beat * BEATS_PER_BLOCK) {
          startRef.current = Date.now();
          setPhase('playing');
        } else {
          setCountMs(elapsed);
        }
      }, 80);
    } else if (phase === 'playing') {
      startRef.current = Date.now();
      tickRef.current = setInterval(() => {
        const next = accumRef.current + (Date.now() - startRef.current);
        if (next >= durationMs) {
          accumRef.current = durationMs;
          setActiveMs(durationMs);
          finish('elapsed', durationMs, completedRef.current);
        } else {
          setActiveMs(next);
        }
      }, 80);
    }
    return clearTick;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, beat, durationMs]);

  const blockIndex = Math.floor(activeMs / block);
  const beatIndex = Math.floor(activeMs / beat) % BEATS_PER_BLOCK;
  const current = chords.length > 0 ? chords[blockIndex % chords.length] : null;
  const next = chords.length > 0 ? chords[(blockIndex + 1) % chords.length] : null;
  const isWarmUp = blockIndex === 0;
  const canMark = phase === 'playing' && markedBlock !== blockIndex;

  const start = () => {
    accumRef.current = 0;
    setActiveMs(0);
    setCompleted(0);
    setMarkedBlock(-1);
    setPhase('countIn');
  };

  const pause = () => {
    accumRef.current = accumRef.current + (Date.now() - startRef.current);
    clearTick();
    setPhase('paused');
  };

  const resume = () => setPhase('countIn');

  const mark = () => {
    if (!canMark) return;
    setMarkedBlock(blockIndex);
    if (!isWarmUp) setCompleted(c => c + 1);
  };

  // ---------------------------------------------------------------- setup
  if (phase === 'idle') {
    return (
      <MaterialBackground variant="practice">
        <ScreenHeader
          title="Practice"
          caption="Mark each change when your fingers are ready."
        />

        <View style={styles.body}>
          <MaterialCard material="paper" padding={14}>
            <View style={styles.setupTop}>
              <Image source={assets.sprite4} style={styles.sprite} resizeMode="contain" />
              <View style={styles.setupText}>
                <Text style={styles.setupTitle}>Chord change drill</Text>
                <Text style={styles.setupSub} numberOfLines={2}>
                  {chords.length + ' chords in a cycle, four beats each.'}
                </Text>
              </View>
            </View>

            <View style={styles.chipRow}>
              {chords.map((v, i) => (
                <View key={v.id + '-' + i} style={styles.chip}>
                  <Text style={styles.chipText}>{chordName(v.root, v.type)}</Text>
                </View>
              ))}
            </View>

            <View style={styles.divider} />

            <LargeStepper
              label="Tempo"
              value={setup.bpm}
              min={BPM_MIN}
              max={BPM_MAX}
              step={BPM_STEP}
              formatValue={v => v + ' BPM'}
              onChange={v => onChangeSetup({ ...setup, bpm: v })}
            />

            <Text style={styles.groupLabel}>Session length</Text>
            <View style={styles.durationRow}>
              {DURATION_CHOICES.map(d => (
                <SecondaryButton
                  key={d}
                  flex
                  label={d + 's'}
                  selected={setup.durationSec === d}
                  onPress={() => onChangeSetup({ ...setup, durationSec: d })}
                />
              ))}
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Play reference on change</Text>
              <Switch
                value={setup.referenceOnChange}
                onValueChange={v => onChangeSetup({ ...setup, referenceOnChange: v })}
                trackColor={{ false: theme.colors.secondary, true: theme.colors.primary }}
                thumbColor={theme.colors.surface}
                accessibilityLabel="Play reference on change"
              />
            </View>
          </MaterialCard>
        </View>

        <View style={styles.panel}>
          <PrimaryButton
            label="START PRACTICE"
            Icon={Timer}
            onPress={start}
            disabled={chords.length < 2}
          />
        </View>

        {tabs}
      </MaterialBackground>
    );
  }

  // ------------------------------------------------------------- active
  const countBeat = Math.min(BEATS_PER_BLOCK - 1, Math.floor(countMs / beat));

  return (
    <MaterialBackground variant="practice">
      <ScreenHeader
        title="Chord changes"
        centerSub={formatClock(activeMs) + ' / ' + formatClock(durationMs)}
        leftSlot={<IconButton Icon={ChevronLeft} label="Pause practice" onPress={pause} />}
        rightSlot={
          phase === 'paused' ? (
            <IconButton Icon={Play} label="Resume practice" onPress={resume} />
          ) : (
            <IconButton Icon={Pause} label="Pause practice" onPress={pause} />
          )
        }
      />

      <View style={styles.body}>
        {phase === 'paused' ? (
          <View style={styles.pauseWrap}>
            <MaterialCard material="paper" padding={18}>
              <Image source={assets.iconPause} style={styles.pauseArt} resizeMode="contain" />
              <Text style={styles.pauseTitle}>Practice paused</Text>
              <Text style={styles.pauseSub}>
                The clock is frozen. Resuming repeats a silent four beat count-in.
              </Text>
              <View style={styles.pauseActions}>
                <PrimaryButton label="RESUME" Icon={Play} onPress={resume} />
                <View style={styles.pauseSecondary}>
                  <SecondaryButton
                    label="Finish session"
                    onPress={() => finish('finished', accumRef.current, completed)}
                  />
                </View>
              </View>
            </MaterialCard>
          </View>
        ) : (
          <View style={styles.activeWrap}>
            <Text style={styles.currentChord} numberOfLines={1} accessibilityRole="header">
              {current ? chordName(current.root, current.type) : ''}
            </Text>

            {current ? (
              <FretboardDiagram
                voicing={current}
                leftHanded={leftHanded}
                frameWidth={BOARD_W - 40}
                cellHeight={24}
                showNotes={false}
              />
            ) : null}

            <View style={styles.beatRow}>
              {[0, 1, 2, 3].map(i => {
                const lit = phase === 'countIn' ? i <= countBeat : i === beatIndex;
                return (
                  <View
                    key={i}
                    style={[styles.beatDot, lit ? styles.beatDotOn : null]}
                  />
                );
              })}
            </View>

            <View style={styles.nextCard}>
              <Text style={styles.nextLabel}>
                {phase === 'countIn' ? 'COUNT IN' : 'NEXT'}
              </Text>
              <Text style={styles.nextChord} numberOfLines={1}>
                {next ? chordName(next.root, next.type) : ''}
              </Text>
            </View>
          </View>
        )}
      </View>

      {phase === 'paused' ? null : (
        <View style={styles.panel}>
          <Text style={styles.status} numberOfLines={1}>
            {isWarmUp
              ? 'Warm-up block. This one is not counted.'
              : 'Changes marked: ' + completed + ' of ' + opportunitiesFor(activeMs, setup.bpm)}
          </Text>

          <PrimaryButton
            label={isWarmUp ? 'READY' : 'CHANGE DONE'}
            Icon={Check}
            onPress={mark}
            disabled={!canMark}
          />

          <View style={styles.panelSecondary}>
            <SecondaryButton
              label="Finish session"
              onPress={() =>
                finish(
                  'finished',
                  accumRef.current + (phase === 'playing' ? Date.now() - startRef.current : 0),
                  completed,
                )
              }
            />
          </View>
        </View>
      )}
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
  setupTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sprite: { width: 52, height: 52 },
  setupText: { flex: 1, minWidth: 0 },
  setupTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  setupSub: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    color: theme.colors.textMuted,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  chip: {
    height: 34,
    minWidth: 54,
    paddingHorizontal: 12,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: theme.alpha.hairline,
    marginVertical: 12,
  },
  groupLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    marginTop: 10,
    marginBottom: 8,
  },
  durationRow: { flexDirection: 'row', gap: 8 },
  switchRow: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 4,
  },
  switchLabel: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  activeWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  currentChord: {
    fontSize: 40,
    lineHeight: 46,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: theme.colors.textPrimary,
    marginBottom: 10,
  },
  beatRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  beatDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.secondary,
  },
  beatDotOn: { backgroundColor: theme.colors.accent },
  nextCard: {
    marginTop: 14,
    minHeight: 64,
    minWidth: 160,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: theme.radius.card,
    backgroundColor: theme.colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextLabel: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: theme.colors.textSecondary,
  },
  nextChord: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  pauseWrap: { flex: 1, justifyContent: 'center' },
  pauseArt: { width: 64, height: 64, alignSelf: 'center', marginBottom: 10 },
  pauseTitle: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  pauseSub: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
  },
  pauseActions: { marginTop: 16 },
  pauseSecondary: { marginTop: 10, alignItems: 'center' },
  panel: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.radius.panel,
    borderTopRightRadius: theme.radius.panel,
    borderTopWidth: 1,
    borderColor: theme.colors.secondary,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    ...theme.shadow.panel,
  },
  panelSecondary: { marginTop: 10, alignItems: 'center' },
  status: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginBottom: 8,
  },
});
