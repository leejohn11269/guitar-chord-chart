import React from 'react';
import { FlatList, Image, StyleSheet, Switch, Text, View } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import assets from '../assets';
import { IconButton, SecondaryButton } from '../components/Buttons';
import MaterialBackground from '../components/MaterialBackground';
import MaterialCard from '../components/MaterialCard';
import ScreenHeader from '../components/ScreenHeader';
import theme from '../constants/theme';
import type { Preferences } from '../hooks/usePreferences';
import { CONTENT_W, SIDE_MARGIN } from '../utils/layout';

type RowKey = 'hand' | 'strum' | 'volume' | 'haptics' | 'motion' | 'about';

const ROWS: RowKey[] = ['hand', 'strum', 'volume', 'haptics', 'motion', 'about'];
const VOLUME_STEPS = [0, 0.25, 0.5, 0.75, 1];

interface SettingsScreenProps {
  prefs: Preferences;
  setPref: <K extends keyof Preferences>(key: K, value: Preferences[K]) => void;
  savedCount: number;
  sheetCount: number;
  onBack: () => void;
}

export default function SettingsScreen({
  prefs,
  setPref,
  savedCount,
  sheetCount,
  onBack,
}: SettingsScreenProps) {
  const renderRow = (key: RowKey) => {
    if (key === 'hand') {
      return (
        <MaterialCard material="paper" padding={16}>
          <View style={styles.switchRow}>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Left-handed mode</Text>
              <Text style={styles.rowDesc}>Mirror chord diagrams for a left-handed guitar.</Text>
            </View>
            <Switch
              value={prefs.leftHanded}
              onValueChange={v => setPref('leftHanded', v)}
              trackColor={{ false: theme.colors.secondary, true: theme.colors.primary }}
              thumbColor={theme.colors.surface}
              accessibilityLabel="Left-handed mode"
            />
          </View>
        </MaterialCard>
      );
    }

    if (key === 'strum') {
      return (
        <MaterialCard material="paper" padding={16}>
          <Text style={styles.rowTitle}>Strum direction</Text>
          <Text style={styles.rowDesc}>Low to high, or high to low.</Text>
          <View style={styles.choiceRow}>
            <SecondaryButton
              flex
              label="Down"
              selected={prefs.strumDirection === 'down'}
              onPress={() => setPref('strumDirection', 'down')}
            />
            <SecondaryButton
              flex
              label="Up"
              selected={prefs.strumDirection === 'up'}
              onPress={() => setPref('strumDirection', 'up')}
            />
          </View>
        </MaterialCard>
      );
    }

    if (key === 'volume') {
      return (
        <MaterialCard material="paper" padding={16}>
          <Text style={styles.rowTitle}>Preview volume</Text>
          <Text style={styles.rowDesc}>Device media volume stays the overall control.</Text>
          <View style={styles.choiceRow}>
            {VOLUME_STEPS.map(v => (
              <SecondaryButton
                key={v}
                flex
                label={Math.round(v * 100) + '%'}
                selected={prefs.previewVolume === v}
                onPress={() => setPref('previewVolume', v)}
              />
            ))}
          </View>
        </MaterialCard>
      );
    }

    if (key === 'haptics') {
      return (
        <MaterialCard material="paper" padding={16}>
          <View style={styles.switchRow}>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Haptic feedback</Text>
              <Text style={styles.rowDesc}>A short tap when a chord is saved.</Text>
            </View>
            <Switch
              value={prefs.saveHaptics}
              onValueChange={v => setPref('saveHaptics', v)}
              trackColor={{ false: theme.colors.secondary, true: theme.colors.primary }}
              thumbColor={theme.colors.surface}
              accessibilityLabel="Haptic feedback"
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.switchRow}>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Beat haptics</Text>
              <Text style={styles.rowDesc}>Pulse on each practice beat.</Text>
            </View>
            <Switch
              value={prefs.beatHaptics}
              onValueChange={v => setPref('beatHaptics', v)}
              trackColor={{ false: theme.colors.secondary, true: theme.colors.primary }}
              thumbColor={theme.colors.surface}
              accessibilityLabel="Beat haptics"
            />
          </View>
        </MaterialCard>
      );
    }

    if (key === 'motion') {
      return (
        <MaterialCard material="paper" padding={16}>
          <View style={styles.switchRow}>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Reduce motion</Text>
              <Text style={styles.rowDesc}>Replace movement with a quiet fade.</Text>
            </View>
            <Switch
              value={prefs.reduceMotion}
              onValueChange={v => setPref('reduceMotion', v)}
              trackColor={{ false: theme.colors.secondary, true: theme.colors.primary }}
              thumbColor={theme.colors.surface}
              accessibilityLabel="Reduce motion"
            />
          </View>
        </MaterialCard>
      );
    }

    return (
      <MaterialCard material="paper" padding={16}>
        <View style={styles.aboutHead}>
          <Image source={assets.iconHome} style={styles.aboutArt} resizeMode="contain" />
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>About</Text>
            <Text style={styles.rowDesc}>Standard tuning, A4 440 Hz.</Text>
          </View>
        </View>
        <Text style={styles.aboutBody}>
          Your chords, sheets and practice history stay on this device.
        </Text>
        {savedCount > 0 && sheetCount > 0 ? (
          <Text style={styles.aboutBody}>
            {savedCount + ' saved chords in ' + sheetCount + ' song sheets.'}
          </Text>
        ) : null}
      </MaterialCard>
    );
  };

  return (
    <MaterialBackground variant="settings">
      <ScreenHeader
        title="Settings"
        caption="Handedness and playback."
        leftSlot={<IconButton Icon={ChevronLeft} label="Back to Chord Finder" onPress={onBack} />}
      />

      <View style={styles.body}>
        <FlatList
          data={ROWS}
          keyExtractor={item => item}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => renderRow(item)}
        />
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
  },
  listContent: { paddingVertical: 14, gap: 12 },
  switchRow: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  rowText: { flex: 1, minWidth: 0 },
  rowTitle: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  rowDesc: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    color: theme.colors.textMuted,
  },
  choiceRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  divider: { height: 1, backgroundColor: theme.alpha.hairline, marginVertical: 6 },
  aboutHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  aboutArt: { width: 44, height: 44 },
  aboutBody: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    marginTop: 10,
  },
});
