import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ChevronLeft, Heart, ListPlus, Play, Square, Timer } from 'lucide-react-native';
import { IconButton, PrimaryButton, SecondaryButton } from '../components/Buttons';
import FretboardDiagram from '../components/FretboardDiagram';
import MaterialBackground from '../components/MaterialBackground';
import PickerModal, { PickerOption } from '../components/PickerModal';
import ScreenHeader from '../components/ScreenHeader';
import ShapeSwitcher from '../components/ShapeSwitcher';
import Snackbar from '../components/Snackbar';
import { TOP_PAD } from '../constants/config';
import theme from '../constants/theme';
import { chordName, chordSpoken, fingeringSentence, noteLabelsForVoicing } from '../game/chordLibrary';
import { CHORD_TYPE_MAP } from '../game/chordTemplates';
import type { Sheet, Voicing } from '../game/types';
import type { PlaybackApi } from '../hooks/usePlayback';
import type { Preferences } from '../hooks/usePreferences';
import { boardChromeHeight, clampCellHeight } from '../utils/fretboardGeometry';
import { BOARD_W, CONTENT_W, SCREEN_H, SIDE_MARGIN } from '../utils/layout';

const HEADER_EST = TOP_PAD + 52 + 10 + 2;
const NOTE_STRIP_H = 24;
const MIDDLE_EST = 48 + 8 + 36 + 8;
const PANEL_EST = 174;
const MARGINS = 20;

const BOARD_CELL_H = clampCellHeight(
  (SCREEN_H - HEADER_EST - NOTE_STRIP_H - MIDDLE_EST - PANEL_EST - MARGINS - boardChromeHeight(true)) / 5,
);

interface GameScreenProps {
  voicing: Voicing;
  shapes: Voicing[];
  shapeIndex: number;
  isFavorite: boolean;
  prefs: Preferences;
  playback: PlaybackApi;
  sheets: Sheet[];
  onShapeChange: (index: number) => void;
  onToggleFavorite: () => void;
  onAddToSheet: (sheetId: string | 'new') => string | null;
  onPractice: () => void;
  onBack: () => void;
}

export default function GameScreen({
  voicing,
  shapes,
  shapeIndex,
  isFavorite,
  prefs,
  playback,
  sheets,
  onShapeChange,
  onToggleFavorite,
  onAddToSheet,
  onPractice,
  onBack,
}: GameScreenProps) {
  const [sheetModal, setSheetModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const name = chordName(voicing.root, voicing.type);
  const spoken = chordSpoken(voicing.root, voicing.type);
  const notes = noteLabelsForVoicing(voicing);
  const playing = playback.state.activeId === voicing.id;

  const sheetOptions: PickerOption[] = sheets
    .map(s => ({ id: s.id, label: s.title }))
    .concat([{ id: 'new', label: 'New sheet' }]);

  const handlePlay = () => playback.toggle(voicing, prefs.strumDirection);

  const handleShape = (next: number) => {
    playback.stop();
    onShapeChange(next);
  };

  return (
    <MaterialBackground variant="diagram">
      <ScreenHeader
        title={name}
        centerSub={CHORD_TYPE_MAP[voicing.type].spoken}
        leftSlot={<IconButton Icon={ChevronLeft} label="Back to Chord Finder" onPress={onBack} />}
        rightSlot={
          <IconButton
            Icon={Heart}
            label={isFavorite ? 'Saved. Remove this shape.' : 'Save this shape'}
            selected={isFavorite}
            onPress={onToggleFavorite}
          />
        }
      />

      <View style={styles.body}>
        <Text style={styles.noteStrip} numberOfLines={1}>
          {notes.filter(n => n !== '').join('   ')}
        </Text>

        <View style={styles.boardWrap}>
          <FretboardDiagram
            voicing={voicing}
            leftHanded={prefs.leftHanded}
            frameWidth={BOARD_W}
            cellHeight={BOARD_CELL_H}
            lit={playing ? playback.state.lit : undefined}
            onPress={handlePlay}
          />
        </View>

        <View style={styles.switcher}>
          <ShapeSwitcher
            index={shapeIndex}
            count={shapes.length}
            positionLabel={voicing.positionLabel}
            difficulty={voicing.difficulty}
            onPrevious={() => handleShape(shapeIndex - 1)}
            onNext={() => handleShape(shapeIndex + 1)}
          />
        </View>

        <Text style={styles.fingering} numberOfLines={2}>
          {fingeringSentence(voicing)}
        </Text>
      </View>

      <View style={styles.panel}>
        <Text style={styles.status} numberOfLines={1}>
          {(prefs.strumDirection === 'down' ? 'Down strum' : 'Up strum') +
            ' · Standard tuning · O open  X muted'}
        </Text>

        <PrimaryButton
          label={playing ? 'STOP' : 'PLAY CHORD'}
          Icon={playing ? Square : Play}
          onPress={handlePlay}
          accessibilityLabel={playing ? 'Stop playback' : 'Play ' + spoken}
        />

        <View style={styles.panelRow}>
          <SecondaryButton
            label="Add to sheet"
            Icon={ListPlus}
            flex
            onPress={() => setSheetModal(true)}
          />
          <SecondaryButton label="Practice" Icon={Timer} flex onPress={onPractice} />
        </View>
      </View>

      <PickerModal
        visible={sheetModal}
        title={'Add ' + name + ' to a sheet'}
        options={sheetOptions}
        selectedId=""
        columns={2}
        onSelect={id => {
          const title = onAddToSheet(id as string);
          setSheetModal(false);
          setToast(title ? 'Added to ' + title : 'Could not save. Try again.');
        }}
        onClose={() => setSheetModal(false)}
      />

      {toast ? <Snackbar message={toast} onDismiss={() => setToast(null)} /> : null}
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
  noteStrip: {
    height: NOTE_STRIP_H,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '700',
    letterSpacing: 1,
    color: theme.colors.woodDark,
    textAlign: 'center',
    marginTop: 2,
  },
  boardWrap: { alignItems: 'center' },
  switcher: { marginTop: 10 },
  fingering: {
    marginTop: 8,
    height: 36,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    textAlign: 'center',
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
  status: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginBottom: 10,
  },
  panelRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
});
