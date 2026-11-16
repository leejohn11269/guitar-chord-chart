import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { ArrowDown, ArrowUp, ChevronLeft, Play, Plus, Square, Trash2 } from 'lucide-react-native';
import assets from '../assets';
import { IconButton, PrimaryButton } from '../components/Buttons';
import EmptyState from '../components/EmptyState';
import MaterialBackground from '../components/MaterialBackground';
import MaterialCard from '../components/MaterialCard';
import ScreenHeader from '../components/ScreenHeader';
import Snackbar from '../components/Snackbar';
import { SHEET_STEP_MS } from '../constants/config';
import theme from '../constants/theme';
import { chordName } from '../game/chordLibrary';
import type { Sheet, SheetEntry, Voicing } from '../game/types';
import type { LibraryApi } from '../hooks/useLibraryStore';
import { HIT_SLOP, usePressScale } from '../components/PressScale';
import { CONTENT_W, SIDE_MARGIN } from '../utils/layout';

interface SongSheetsScreenProps {
  library: LibraryApi;
  currentVoicing: Voicing;
  onOpenChord: (voicing: Voicing) => void;
  tabs: React.ReactNode;
}

function SheetCard({ sheet, onOpen, onDelete }: { sheet: Sheet; onOpen: () => void; onDelete: () => void }) {
  const { scale, onPressIn, onPressOut } = usePressScale(0.98);
  const chips = sheet.entries.slice(0, 4).map(e => chordName(e.root, e.type));

  return (
    <View style={styles.rowWrap}>
      <Pressable
        style={styles.cardPress}
        onPress={onOpen}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        hitSlop={HIT_SLOP}
        accessibilityRole="button"
        accessibilityLabel={sheet.title + ', ' + sheet.entries.length + ' chords'}>
        <Animated.View pointerEvents="box-none" style={{ transform: [{ scale }] }}>
          <MaterialCard material="paper" padding={14}>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {sheet.title}
            </Text>
            <Text style={styles.cardMeta} numberOfLines={1}>
              {sheet.entries.length === 1 ? '1 chord' : sheet.entries.length + ' chords'}
            </Text>
            {chips.length > 0 ? (
              <View style={styles.chipRow}>
                {chips.map((c, i) => (
                  <View key={i} style={styles.chip}>
                    <Text style={styles.chipText}>{c}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </MaterialCard>
        </Animated.View>
      </Pressable>

      <View style={styles.rowAction}>
        <IconButton Icon={Trash2} label={'Delete ' + sheet.title} onPress={onDelete} />
      </View>
    </View>
  );
}

function EntryRow({
  entry,
  index,
  total,
  playing,
  onOpen,
  onMoveUp,
  onMoveDown,
  onRemove,
}: {
  entry: SheetEntry;
  index: number;
  total: number;
  playing: boolean;
  onOpen: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}) {
  const name = chordName(entry.root, entry.type);

  return (
    <View
      style={[
        styles.entry,
        theme.shadow.card,
        playing ? styles.entryPlaying : null,
      ]}>
      <Pressable
        style={styles.entryBody}
        onPress={onOpen}
        hitSlop={HIT_SLOP}
        accessibilityRole="button"
        accessibilityLabel={'Open ' + name + ', position ' + (index + 1)}>
        <Text style={styles.entryIndex}>{index + 1}</Text>
        <View style={styles.entryText}>
          <Text style={styles.entryName} numberOfLines={1}>
            {name}
          </Text>
          <Text style={styles.entryPos} numberOfLines={1}>
            {entry.snapshot.positionLabel}
          </Text>
        </View>
      </Pressable>

      <View style={styles.entryActions}>
        <IconButton
          Icon={ArrowUp}
          label={'Move ' + name + ' up'}
          disabled={index === 0}
          onPress={onMoveUp}
        />
        <IconButton
          Icon={ArrowDown}
          label={'Move ' + name + ' down'}
          disabled={index === total - 1}
          onPress={onMoveDown}
        />
        <IconButton Icon={Trash2} label={'Remove ' + name} onPress={onRemove} />
      </View>
    </View>
  );
}

export default function SongSheetsScreen({
  library,
  currentVoicing,
  onOpenChord,
  tabs,
}: SongSheetsScreenProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [playIndex, setPlayIndex] = useState(-1);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const sheet = openId ? library.getSheet(openId) : null;

  const stopSequence = useCallback(() => {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
    setPlayIndex(-1);
  }, []);

  useEffect(() => stopSequence, [stopSequence]);
  useEffect(() => {
    if (!sheet) stopSequence();
  }, [sheet, stopSequence]);

  const startSequence = (total: number) => {
    stopSequence();
    setPlayIndex(0);
    let i = 0;
    timer.current = setInterval(() => {
      i += 1;
      if (i >= total) {
        stopSequence();
        return;
      }
      setPlayIndex(i);
    }, SHEET_STEP_MS);
  };

  const newSheet = () => {
    const created = library.createSheet('My song ' + (library.sheets.length + 1));
    if (!created) {
      setToast('Sheet limit reached.');
      return;
    }
    setOpenId(created.id);
  };

  if (sheet) {
    return (
      <MaterialBackground variant="sheets">
        <ScreenHeader
          title={sheet.title}
          centerSub={sheet.entries.length + ' chords'}
          leftSlot={
            <IconButton
              Icon={ChevronLeft}
              label="Back to song sheets"
              onPress={() => {
                stopSequence();
                setOpenId(null);
              }}
            />
          }
          rightSlot={
            <IconButton
              Icon={Plus}
              label={'Add ' + chordName(currentVoicing.root, currentVoicing.type)}
              onPress={() => {
                const ok = library.addToSheet(sheet.id, currentVoicing);
                setToast(
                  ok
                    ? 'Added ' + chordName(currentVoicing.root, currentVoicing.type)
                    : 'This sheet is full.',
                );
              }}
            />
          }
        />

        <View style={styles.body}>
          {sheet.entries.length === 0 ? (
            <View style={styles.emptyWrap}>
              <EmptyState
                illustration={assets.sprite2}
                title="Add your first chord"
                body="Pick a chord in Finder, then add it here in the order you play it."
                primaryLabel="ADD CURRENT CHORD"
                onPrimary={() => {
                  library.addToSheet(sheet.id, currentVoicing);
                  setToast('Added ' + chordName(currentVoicing.root, currentVoicing.type));
                }}
              />
            </View>
          ) : (
            <FlatList
              data={sheet.entries}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              renderItem={({ item, index }) => (
                <EntryRow
                  entry={item}
                  index={index}
                  total={sheet.entries.length}
                  playing={playIndex === index}
                  onOpen={() => onOpenChord(item.snapshot)}
                  onMoveUp={() => library.moveEntry(sheet.id, index, -1)}
                  onMoveDown={() => library.moveEntry(sheet.id, index, 1)}
                  onRemove={() => library.removeEntry(sheet.id, item.id)}
                />
              )}
            />
          )}
        </View>

        {sheet.entries.length > 0 ? (
          <View style={styles.panel}>
            <Text style={styles.panelCaption}>One chord every 2 seconds</Text>
            <PrimaryButton
              label={playIndex >= 0 ? 'STOP' : 'PLAY SHEET'}
              Icon={playIndex >= 0 ? Square : Play}
              onPress={() =>
                playIndex >= 0 ? stopSequence() : startSequence(sheet.entries.length)
              }
            />
          </View>
        ) : null}

        {tabs}
        {toast ? <Snackbar message={toast} onDismiss={() => setToast(null)} /> : null}
      </MaterialBackground>
    );
  }

  return (
    <MaterialBackground variant="sheets">
      <ScreenHeader
        title="Song Sheets"
        caption="Keep your progressions in playing order."
        rightSlot={<IconButton Icon={Plus} label="New sheet" onPress={newSheet} />}
      />

      <View style={styles.body}>
        {library.sheets.length === 0 ? (
          <View style={styles.emptyWrap}>
            <EmptyState
              illustration={assets.sprite2}
              title="Keep a song within reach"
              body="Add chords in the order you play them."
              primaryLabel="CREATE SHEET"
              onPrimary={newSheet}
              secondaryLabel="Try C - G - Am - F"
              onSecondary={() => {
                const created = library.createSheet('First progression');
                if (created) {
                  setOpenId(created.id);
                  setToast('Sheet created. Add chords from Finder.');
                }
              }}
            />
          </View>
        ) : (
          <FlatList
            data={library.sheets}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <SheetCard
                sheet={item}
                onOpen={() => setOpenId(item.id)}
                onDelete={() => {
                  library.deleteSheet(item.id);
                  setToast('Deleted ' + item.title);
                }}
              />
            )}
          />
        )}
      </View>

      {tabs}
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
  emptyWrap: { flex: 1, justifyContent: 'center' },
  listContent: { paddingVertical: 14, gap: 12 },
  rowWrap: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardPress: { flex: 1, minWidth: 0 },
  rowAction: { width: 48, height: 48 },
  cardTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  cardMeta: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  chip: {
    height: 26,
    paddingHorizontal: 10,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  entry: {
    minHeight: 88,
    borderRadius: theme.radius.tile,
    borderWidth: 1,
    borderColor: theme.colors.secondary,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  entryPlaying: {
    borderColor: theme.colors.accent,
    borderWidth: 2,
    backgroundColor: theme.alpha.accentWash,
  },
  entryBody: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 10 },
  entryIndex: {
    width: 26,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
    color: theme.colors.textMuted,
    fontVariant: ['tabular-nums'],
  },
  entryText: { flex: 1, minWidth: 0 },
  entryName: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  entryPos: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    color: theme.colors.textMuted,
  },
  entryActions: { flexDirection: 'row', gap: 4 },
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
  panelCaption: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginBottom: 8,
  },
});
