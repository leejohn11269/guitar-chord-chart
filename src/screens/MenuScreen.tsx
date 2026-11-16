import React, { useMemo, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Heart, Play, Settings as SettingsIcon, Square } from 'lucide-react-native';
import assets from '../assets';
import { IconButton, PrimaryButton } from '../components/Buttons';
import FretboardDiagram from '../components/FretboardDiagram';
import MaterialBackground from '../components/MaterialBackground';
import MaterialCard from '../components/MaterialCard';
import PickerModal, { PickerOption } from '../components/PickerModal';
import { ChordTypePicker, RootPicker } from '../components/PickerRow';
import ScreenHeader from '../components/ScreenHeader';
import { TAB_BAR_H, TOP_PAD } from '../constants/config';
import theme from '../constants/theme';
import { CHORD_TYPES, ROOTS, chordName, chordSpoken } from '../game/chordLibrary';
import { CHORD_TYPE_MAP } from '../game/chordTemplates';
import type { ChordTypeId, Voicing } from '../game/types';
import type { PlaybackApi } from '../hooks/usePlayback';
import type { Preferences } from '../hooks/usePreferences';
import { boardChromeHeight, clampCellHeight } from '../utils/fretboardGeometry';
import { BOARD_W, CONTENT_W, SCREEN_H, SIDE_MARGIN } from '../utils/layout';

/** Fixed furniture around the hero — used to size the preview diagram. */
const HEADER_EST = TOP_PAD + 52 + 10 + 23;
const SHEET_EST = 237;
const HERO_OVERHEAD = 114;
const VERTICAL_MARGINS = 8;

const HERO_CELL_H = clampCellHeight(
  (SCREEN_H -
    HEADER_EST -
    TAB_BAR_H -
    SHEET_EST -
    HERO_OVERHEAD -
    VERTICAL_MARGINS -
    boardChromeHeight(false)) /
    5,
);

const ROOT_OPTIONS: PickerOption[] = ROOTS.map((label, i) => ({
  id: String(i),
  label,
  spoken: 'Key ' + label,
}));

const TYPE_OPTIONS: PickerOption[] = CHORD_TYPES.map(t => ({
  id: t.id,
  label: t.label,
  spoken: t.spoken,
}));

interface MenuScreenProps {
  root: number;
  type: ChordTypeId;
  voicing: Voicing;
  favorites: Voicing[];
  isFavorite: (id: string) => boolean;
  prefs: Preferences;
  playback: PlaybackApi;
  onChangeRoot: (root: number) => void;
  onChangeType: (type: ChordTypeId) => void;
  onSelectVoicing: (voicing: Voicing) => void;
  onToggleFavorite: () => void;
  onStartLearning: () => void;
  onOpenSettings: () => void;
  tabs: React.ReactNode;
}

export default function MenuScreen({
  root,
  type,
  voicing,
  favorites,
  isFavorite,
  prefs,
  playback,
  onChangeRoot,
  onChangeType,
  onSelectVoicing,
  onToggleFavorite,
  onStartLearning,
  onOpenSettings,
  tabs,
}: MenuScreenProps) {
  const [modal, setModal] = useState<'none' | 'root' | 'type' | 'favorites'>('none');

  const name = chordName(root, type);
  const spoken = chordSpoken(root, type);
  const saved = isFavorite(voicing.id);
  const playing = playback.state.activeId === voicing.id;

  const favoriteOptions: PickerOption[] = useMemo(
    () =>
      favorites.map(f => ({
        id: f.id,
        label: chordName(f.root, f.type),
        spoken: chordSpoken(f.root, f.type) + ', ' + f.positionLabel,
      })),
    [favorites],
  );

  const togglePlay = () => playback.toggle(voicing, prefs.strumDirection);

  return (
    <MaterialBackground variant="finder">
      <ScreenHeader
        title="Chord Finder"
        caption="Choose it. Hear it. Learn it."
        leftSlot={
          <IconButton
            Icon={Heart}
            label="Saved chords"
            selected={favorites.length > 0}
            onPress={() => setModal('favorites')}
          />
        }
        rightSlot={<IconButton Icon={SettingsIcon} label="Settings" onPress={onOpenSettings} />}
      />

      <View style={styles.body}>
        <View style={styles.heroWrap}>
          <MaterialCard material="paper" padding={14}>
            <View style={styles.heroTop}>
              <View style={styles.heroName}>
                <Text style={styles.chordName} numberOfLines={1} accessibilityRole="header">
                  {name}
                </Text>
                <Text style={styles.chordPosition} numberOfLines={1}>
                  {voicing.positionLabel + ' · ' + CHORD_TYPE_MAP[type].spoken}
                </Text>
              </View>

              <Image source={assets.sprite1} style={styles.heroSprite} resizeMode="contain" />

              <IconButton
                Icon={Heart}
                label={saved ? 'Remove from saved chords' : 'Save this shape'}
                selected={saved}
                onPress={onToggleFavorite}
              />

              <IconButton
                Icon={playing ? Square : Play}
                label={playing ? 'Stop preview' : 'Play ' + spoken}
                selected={playing}
                onPress={togglePlay}
              />
            </View>

            <View style={styles.heroBoard}>
              <FretboardDiagram
                voicing={voicing}
                leftHanded={prefs.leftHanded}
                frameWidth={BOARD_W - 30}
                cellHeight={HERO_CELL_H}
                showNotes={false}
                lit={playback.state.activeId === voicing.id ? playback.state.lit : undefined}
                onPress={togglePlay}
              />
            </View>

            <Text style={styles.heroCaption} numberOfLines={1}>
              {playing ? 'Strumming ' + spoken : 'Tap the chord to hear ' + spoken}
            </Text>
          </MaterialCard>
        </View>

        <View style={styles.sheet}>
          <View style={styles.sheetGrip} />

          <RootPicker
            value={ROOTS[root]}
            onPrev={() => onChangeRoot((root + 11) % 12)}
            onNext={() => onChangeRoot((root + 1) % 12)}
            onOpenGrid={() => setModal('root')}
          />

          <View style={styles.rowGap} />

          <ChordTypePicker value={CHORD_TYPE_MAP[type].label} onOpenGrid={() => setModal('type')} />

          <Text style={styles.hint} numberOfLines={1}>
            {'ONE TAP TO HEAR · ONE TAP TO LEARN'}
          </Text>

          <PrimaryButton
            label="START LEARNING"
            onPress={onStartLearning}
            accessibilityLabel={'Start learning ' + spoken}
          />
        </View>
      </View>

      {tabs}

      <PickerModal
        visible={modal === 'root'}
        title="Choose a key"
        options={ROOT_OPTIONS}
        selectedId={String(root)}
        columns={4}
        onSelect={id => {
          onChangeRoot(Number(id));
          setModal('none');
        }}
        onClose={() => setModal('none')}
      />

      <PickerModal
        visible={modal === 'type'}
        title="Choose a chord type"
        options={TYPE_OPTIONS}
        selectedId={type}
        columns={2}
        onSelect={id => {
          onChangeType(id as ChordTypeId);
          setModal('none');
        }}
        onClose={() => setModal('none')}
      />

      <PickerModal
        visible={modal === 'favorites' && favorites.length > 0}
        title="Saved chords"
        options={favoriteOptions}
        selectedId={voicing.id}
        columns={3}
        onSelect={id => {
          const found = favorites.find(f => f.id === id);
          if (found) onSelectVoicing(found);
          setModal('none');
        }}
        onClose={() => setModal('none')}
      />

      <PickerModal
        visible={modal === 'favorites' && favorites.length === 0}
        title="No saved chords yet"
        options={[{ id: 'browse', label: 'Browse chords' }]}
        selectedId="browse"
        columns={1}
        onSelect={() => setModal('none')}
        onClose={() => setModal('none')}
      />
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
  heroWrap: { flex: 1, justifyContent: 'center', paddingVertical: 4, overflow: 'hidden' },
  heroTop: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  heroName: { flex: 1, minWidth: 0 },
  chordName: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: theme.colors.textPrimary,
  },
  chordPosition: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
  heroSprite: { width: 40, height: 40 },
  heroBoard: { alignItems: 'center', marginTop: 8 },
  heroCaption: {
    marginTop: 6,
    height: 18,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  sheet: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.radius.panel,
    borderTopRightRadius: theme.radius.panel,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: theme.colors.secondary,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 14,
    marginHorizontal: -SIDE_MARGIN + 6,
    ...theme.shadow.panel,
  },
  sheetGrip: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.secondary,
    alignSelf: 'center',
    marginBottom: 6,
  },
  rowGap: { height: 8 },
  hint: {
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
});
