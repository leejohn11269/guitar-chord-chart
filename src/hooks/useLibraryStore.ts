import { useCallback, useState } from 'react';
import { MAX_ENTRIES_PER_SHEET, MAX_SHEETS } from '../constants/config';
import type { Sheet, SheetEntry, Voicing } from '../game/types';

let idCounter = 0;
function localId(prefix: string): string {
  idCounter += 1;
  return prefix + '-' + Date.now().toString(36) + '-' + idCounter;
}

export interface LibraryApi {
  favorites: Voicing[];
  sheets: Sheet[];
  isFavorite: (voicingId: string) => boolean;
  toggleFavorite: (voicing: Voicing) => boolean;
  createSheet: (title: string) => Sheet | null;
  renameSheet: (sheetId: string, title: string) => void;
  deleteSheet: (sheetId: string) => void;
  addToSheet: (sheetId: string, voicing: Voicing) => boolean;
  removeEntry: (sheetId: string, entryId: string) => void;
  moveEntry: (sheetId: string, index: number, delta: number) => void;
  getSheet: (sheetId: string) => Sheet | null;
}

/** Favorites and song sheets, shared by Finder, Diagram, Sheets and Practice. */
export function useLibraryStore(): LibraryApi {
  const [favorites, setFavorites] = useState<Voicing[]>([]);
  const [sheets, setSheets] = useState<Sheet[]>([]);

  const isFavorite = useCallback(
    (voicingId: string) => favorites.some(f => f.id === voicingId),
    [favorites],
  );

  const toggleFavorite = useCallback(
    (voicing: Voicing) => {
      const found = favorites.some(f => f.id === voicing.id);
      setFavorites(prev =>
        prev.some(f => f.id === voicing.id)
          ? prev.filter(f => f.id !== voicing.id)
          : prev.concat([voicing]),
      );
      return !found;
    },
    [favorites],
  );

  const createSheet = useCallback(
    (title: string) => {
      const trimmed = title.trim();
      if (trimmed.length < 1 || trimmed.length > 60) return null;
      if (sheets.length >= MAX_SHEETS) return null;
      const sheet: Sheet = {
        id: localId('sheet'),
        title: trimmed,
        createdAt: Date.now(),
        entries: [],
      };
      setSheets(prev => (prev.length >= MAX_SHEETS ? prev : prev.concat([sheet])));
      return sheet;
    },
    [sheets.length],
  );

  const renameSheet = useCallback((sheetId: string, title: string) => {
    const trimmed = title.trim();
    if (trimmed.length < 1 || trimmed.length > 60) return;
    setSheets(prev => prev.map(s => (s.id === sheetId ? { ...s, title: trimmed } : s)));
  }, []);

  const deleteSheet = useCallback((sheetId: string) => {
    setSheets(prev => prev.filter(s => s.id !== sheetId));
  }, []);

  const addToSheet = useCallback(
    (sheetId: string, voicing: Voicing) => {
      const target = sheets.find(s => s.id === sheetId);
      if (!target || target.entries.length >= MAX_ENTRIES_PER_SHEET) return false;
      const entry: SheetEntry = {
        id: localId('entry'),
        root: voicing.root,
        type: voicing.type,
        voicingId: voicing.id,
        snapshot: voicing,
      };
      setSheets(prev =>
        prev.map(s =>
          s.id === sheetId && s.entries.length < MAX_ENTRIES_PER_SHEET
            ? { ...s, entries: s.entries.concat([entry]) }
            : s,
        ),
      );
      return true;
    },
    [sheets],
  );

  const removeEntry = useCallback((sheetId: string, entryId: string) => {
    setSheets(prev =>
      prev.map(s =>
        s.id === sheetId ? { ...s, entries: s.entries.filter(e => e.id !== entryId) } : s,
      ),
    );
  }, []);

  const moveEntry = useCallback((sheetId: string, index: number, delta: number) => {
    setSheets(prev =>
      prev.map(s => {
        if (s.id !== sheetId) return s;
        const target = index + delta;
        if (target < 0 || target >= s.entries.length) return s;
        const next = s.entries.slice();
        const tmp = next[index];
        next[index] = next[target];
        next[target] = tmp;
        return { ...s, entries: next };
      }),
    );
  }, []);

  const getSheet = useCallback(
    (sheetId: string) => sheets.find(s => s.id === sheetId) || null,
    [sheets],
  );

  return {
    favorites,
    sheets,
    isFavorite,
    toggleFavorite,
    createSheet,
    renameSheet,
    deleteSheet,
    addToSheet,
    removeEntry,
    moveEntry,
    getSheet,
  };
}
