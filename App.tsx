/**
 * Guitar Chord Chart — route state machine.
 * Gameplay, lookup, persistence and timing live outside this file.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { BackHandler, StatusBar, StyleSheet, View } from 'react-native';
import BottomTabs, { TabKey } from './src/components/BottomTabs';
import { BPM_DEFAULT, DURATION_DEFAULT } from './src/constants/config';
import theme from './src/constants/theme';
import { getShapes } from './src/game/chordLibrary';
import type { ChordTypeId, PracticeSetup, PracticeSummary, Voicing } from './src/game/types';
import { useLibraryStore } from './src/hooks/useLibraryStore';
import { usePlayback } from './src/hooks/usePlayback';
import { usePreferences } from './src/hooks/usePreferences';
import GameOverScreen from './src/screens/GameOverScreen';
import GameScreen from './src/screens/GameScreen';
import LoaderScreen from './src/screens/LoaderScreen';
import MenuScreen from './src/screens/MenuScreen';
import PracticeScreen from './src/screens/PracticeScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import SongSheetsScreen from './src/screens/SongSheetsScreen';
import TunerReferenceScreen from './src/screens/TunerReferenceScreen';

type Screen =
  | 'loader'
  | 'menu'
  | 'game'
  | 'sheets'
  | 'tuner'
  | 'practice'
  | 'gameover'
  | 'settings';

interface Selection {
  root: number;
  type: ChordTypeId;
  shapeIndex: number;
}

/** C, G, Am, Em — the first cycle every learner meets. */
function defaultPracticeSetup(): PracticeSetup {
  const pick = (root: number, type: ChordTypeId) => getShapes(root, type)[0];
  return {
    voicings: [pick(0, 'major'), pick(7, 'major'), pick(9, 'minor'), pick(4, 'minor')],
    bpm: BPM_DEFAULT,
    durationSec: DURATION_DEFAULT,
    referenceOnChange: true,
  };
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('loader');
  const [selection, setSelection] = useState<Selection>({
    root: 0,
    type: 'major',
    shapeIndex: 0,
  });
  const [practiceSetup, setPracticeSetup] = useState<PracticeSetup>(defaultPracticeSetup);
  const [summary, setSummary] = useState<PracticeSummary | null>(null);

  const library = useLibraryStore();
  const { prefs, setPref, tapHaptic } = usePreferences();
  const playback = usePlayback();

  const shapes = useMemo(
    () => getShapes(selection.root, selection.type),
    [selection.root, selection.type],
  );
  const shapeIndex = Math.min(selection.shapeIndex, shapes.length - 1);
  const voicing = shapes[shapeIndex];

  const goto = useCallback(
    (next: Screen) => {
      playback.stop();
      setScreen(next);
    },
    [playback],
  );

  // Android back: detail screens return to their caller, tabs return to Finder.
  useEffect(() => {
    const onBack = () => {
      if (screen === 'loader' || screen === 'menu') return false;
      if (screen === 'game' || screen === 'settings') {
        goto('menu');
        return true;
      }
      if (screen === 'gameover') {
        goto('practice');
        return true;
      }
      goto('menu');
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
    return () => sub.remove();
  }, [screen, goto]);

  const selectVoicing = useCallback((v: Voicing) => {
    const list = getShapes(v.root, v.type);
    const index = Math.max(0, list.findIndex(s => s.id === v.id));
    setSelection({ root: v.root, type: v.type, shapeIndex: index });
  }, []);

  const toggleFavorite = useCallback(() => {
    library.toggleFavorite(voicing);
    tapHaptic();
  }, [library, tapHaptic, voicing]);

  const handleTab = useCallback(
    (key: TabKey) => {
      if (key === 'finder') goto('menu');
      else if (key === 'sheets') goto('sheets');
      else if (key === 'tones') goto('tuner');
      else goto('practice');
    },
    [goto],
  );

  const activeTab: TabKey =
    screen === 'sheets'
      ? 'sheets'
      : screen === 'tuner'
      ? 'tones'
      : screen === 'practice'
      ? 'practice'
      : 'finder';

  const tabs = <BottomTabs activeTab={activeTab} onSelect={handleTab} />;

  const addToSheet = useCallback(
    (sheetId: string) => {
      if (sheetId === 'new') {
        const created = library.createSheet('My song ' + (library.sheets.length + 1));
        if (!created) return null;
        library.addToSheet(created.id, voicing);
        tapHaptic();
        return created.title;
      }
      const target = library.sheets.find(s => s.id === sheetId);
      if (!target) return null;
      const ok = library.addToSheet(sheetId, voicing);
      if (ok) tapHaptic();
      return ok ? target.title : null;
    },
    [library, tapHaptic, voicing],
  );

  const startPracticeWithCurrent = useCallback(() => {
    setPracticeSetup(prev => {
      const already = prev.voicings.some(v => v.id === voicing.id);
      if (already) return prev;
      const next = [voicing].concat(prev.voicings).slice(0, 4);
      return { ...prev, voicings: next };
    });
    goto('practice');
  }, [goto, voicing]);

  let content: React.ReactNode = null;

  if (screen === 'loader') {
    content = <LoaderScreen onDone={() => setScreen('menu')} />;
  } else if (screen === 'menu') {
    content = (
      <MenuScreen
        root={selection.root}
        type={selection.type}
        voicing={voicing}
        favorites={library.favorites}
        isFavorite={library.isFavorite}
        prefs={prefs}
        playback={playback}
        onChangeRoot={root => setSelection(s => ({ ...s, root, shapeIndex: 0 }))}
        onChangeType={type => setSelection(s => ({ ...s, type, shapeIndex: 0 }))}
        onSelectVoicing={selectVoicing}
        onToggleFavorite={toggleFavorite}
        onStartLearning={() => goto('game')}
        onOpenSettings={() => goto('settings')}
        tabs={tabs}
      />
    );
  } else if (screen === 'game') {
    content = (
      <GameScreen
        voicing={voicing}
        shapes={shapes}
        shapeIndex={shapeIndex}
        isFavorite={library.isFavorite(voicing.id)}
        prefs={prefs}
        playback={playback}
        sheets={library.sheets}
        onShapeChange={index =>
          setSelection(s => ({
            ...s,
            shapeIndex: Math.max(0, Math.min(shapes.length - 1, index)),
          }))
        }
        onToggleFavorite={toggleFavorite}
        onAddToSheet={addToSheet}
        onPractice={startPracticeWithCurrent}
        onBack={() => goto('menu')}
      />
    );
  } else if (screen === 'sheets') {
    content = (
      <SongSheetsScreen
        library={library}
        currentVoicing={voicing}
        onOpenChord={v => {
          selectVoicing(v);
          goto('game');
        }}
        tabs={tabs}
      />
    );
  } else if (screen === 'tuner') {
    content = <TunerReferenceScreen leftHanded={prefs.leftHanded} tabs={tabs} />;
  } else if (screen === 'practice') {
    content = (
      <PracticeScreen
        setup={practiceSetup}
        leftHanded={prefs.leftHanded}
        onChangeSetup={setPracticeSetup}
        onFinish={result => {
          setSummary(result);
          setScreen('gameover');
        }}
        tabs={tabs}
      />
    );
  } else if (screen === 'gameover' && summary) {
    content = (
      <GameOverScreen
        summary={summary}
        onPracticeAgain={() => goto('practice')}
        onBackToFinder={() => goto('menu')}
      />
    );
  } else if (screen === 'settings') {
    content = (
      <SettingsScreen
        prefs={prefs}
        setPref={setPref}
        savedCount={library.favorites.length}
        sheetCount={library.sheets.length}
        onBack={() => goto('menu')}
      />
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={screen === 'loader' ? 'light-content' : 'dark-content'}
      />
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.background },
});
