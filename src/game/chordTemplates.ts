import type { Barre, ChordTypeDef, ChordTypeId, FretValue } from './types';

export const X: null = null;

/** Chromatic roots. ASCII spellings only — no sharp/flat glyphs. */
export const ROOTS = [
  'C',
  'C#/Db',
  'D',
  'D#/Eb',
  'E',
  'F',
  'F#/Gb',
  'G',
  'G#/Ab',
  'A',
  'A#/Bb',
  'B',
];

/** Short name used on diagrams and chips. */
export const ROOTS_SHORT = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const CHORD_TYPES: ChordTypeDef[] = [
  { id: 'major', label: 'Major', spoken: 'major', suffix: '', intervals: [0, 4, 7] },
  { id: 'minor', label: 'Minor', spoken: 'minor', suffix: 'm', intervals: [0, 3, 7] },
  { id: 'dom7', label: '7', spoken: 'dominant seventh', suffix: '7', intervals: [0, 4, 7, 10] },
  { id: 'maj7', label: 'maj7', spoken: 'major seventh', suffix: 'maj7', intervals: [0, 4, 7, 11] },
  { id: 'min7', label: 'm7', spoken: 'minor seventh', suffix: 'm7', intervals: [0, 3, 7, 10] },
  { id: 'sus2', label: 'sus2', spoken: 'suspended second', suffix: 'sus2', intervals: [0, 2, 7] },
  { id: 'sus4', label: 'sus4', spoken: 'suspended fourth', suffix: 'sus4', intervals: [0, 5, 7] },
  { id: 'dim', label: 'dim', spoken: 'diminished', suffix: 'dim', intervals: [0, 3, 6] },
];

export const CHORD_TYPE_MAP: Record<ChordTypeId, ChordTypeDef> = CHORD_TYPES.reduce(
  (acc, t) => {
    acc[t.id] = t;
    return acc;
  },
  {} as Record<ChordTypeId, ChordTypeDef>,
);

interface FamilyTemplate {
  frets: FretValue[];
  shiftedFingers: FretValue[];
  openFingers: FretValue[];
  /** base index barre span at positive shifts; null = single contact */
  baseBarre: [number, number] | null;
  /** extra barre at positive shifts: [fromString, toString, fretOffset, finger] */
  extraBarre: [number, number, number, number] | null;
}

/** Arrays run low E -> high e. */
export const E_FAMILY: Record<ChordTypeId, FamilyTemplate> = {
  major: {
    frets: [0, 2, 2, 1, 0, 0],
    shiftedFingers: [1, 3, 4, 2, 1, 1],
    openFingers: [0, 2, 3, 1, 0, 0],
    baseBarre: [6, 1],
    extraBarre: null,
  },
  minor: {
    frets: [0, 2, 2, 0, 0, 0],
    shiftedFingers: [1, 3, 4, 1, 1, 1],
    openFingers: [0, 2, 3, 0, 0, 0],
    baseBarre: [6, 1],
    extraBarre: null,
  },
  dom7: {
    frets: [0, 2, 0, 1, 0, 0],
    shiftedFingers: [1, 3, 1, 2, 1, 1],
    openFingers: [0, 2, 0, 1, 0, 0],
    baseBarre: [6, 1],
    extraBarre: null,
  },
  maj7: {
    frets: [0, 2, 1, 1, 0, 0],
    shiftedFingers: [1, 4, 2, 2, 1, 1],
    openFingers: [0, 3, 1, 2, 0, 0],
    baseBarre: [6, 1],
    extraBarre: [4, 3, 1, 2],
  },
  min7: {
    frets: [0, 2, 0, 0, 0, 0],
    shiftedFingers: [1, 3, 1, 1, 1, 1],
    openFingers: [0, 2, 0, 0, 0, 0],
    baseBarre: [6, 1],
    extraBarre: null,
  },
  sus2: {
    frets: [0, 2, 4, 4, X, X],
    shiftedFingers: [1, 2, 4, 4, X, X],
    openFingers: [0, 1, 3, 4, X, X],
    baseBarre: null,
    extraBarre: [4, 3, 4, 4],
  },
  sus4: {
    frets: [0, 2, 2, 2, 0, 0],
    shiftedFingers: [1, 2, 3, 4, 1, 1],
    openFingers: [0, 1, 2, 3, 0, 0],
    baseBarre: [6, 1],
    extraBarre: null,
  },
  dim: {
    frets: [0, 1, 2, 0, X, X],
    shiftedFingers: [1, 2, 3, 1, X, X],
    openFingers: [0, 1, 2, 0, X, X],
    baseBarre: [6, 3],
    extraBarre: null,
  },
};

export const A_FAMILY: Record<ChordTypeId, FamilyTemplate> = {
  major: {
    frets: [X, 0, 2, 2, 2, 0],
    shiftedFingers: [X, 1, 3, 3, 3, 1],
    openFingers: [X, 0, 1, 2, 3, 0],
    baseBarre: [5, 1],
    extraBarre: [4, 2, 2, 3],
  },
  minor: {
    frets: [X, 0, 2, 2, 1, 0],
    shiftedFingers: [X, 1, 3, 4, 2, 1],
    openFingers: [X, 0, 2, 3, 1, 0],
    baseBarre: [5, 1],
    extraBarre: null,
  },
  dom7: {
    frets: [X, 0, 2, 0, 2, 0],
    shiftedFingers: [X, 1, 2, 1, 3, 1],
    openFingers: [X, 0, 1, 0, 2, 0],
    baseBarre: [5, 1],
    extraBarre: null,
  },
  maj7: {
    frets: [X, 0, 2, 1, 2, 0],
    shiftedFingers: [X, 1, 3, 2, 4, 1],
    openFingers: [X, 0, 2, 1, 3, 0],
    baseBarre: [5, 1],
    extraBarre: null,
  },
  min7: {
    frets: [X, 0, 2, 0, 1, 0],
    shiftedFingers: [X, 1, 3, 1, 2, 1],
    openFingers: [X, 0, 2, 0, 1, 0],
    baseBarre: [5, 1],
    extraBarre: null,
  },
  sus2: {
    frets: [X, 0, 2, 2, 0, 0],
    shiftedFingers: [X, 1, 3, 4, 1, 1],
    openFingers: [X, 0, 2, 3, 0, 0],
    baseBarre: [5, 1],
    extraBarre: null,
  },
  sus4: {
    frets: [X, 0, 2, 2, 3, 0],
    shiftedFingers: [X, 1, 2, 3, 4, 1],
    openFingers: [X, 0, 1, 2, 3, 0],
    baseBarre: [5, 1],
    extraBarre: null,
  },
  dim: {
    frets: [X, 0, 1, 2, 1, X],
    shiftedFingers: [X, 1, 2, 3, 2, X],
    openFingers: [X, 0, 1, 3, 2, X],
    baseBarre: null,
    extraBarre: [4, 2, 1, 2],
  },
};

export interface FamiliarShape {
  id: string;
  root: number;
  type: ChordTypeId;
  frets: FretValue[];
  fingers: FretValue[];
  barres: Barre[];
  difficulty: 'Open' | 'Barre' | 'Stretch';
}

/** The shapes every beginner meets first. Deduplicated against the transposed families. */
export const FAMILIAR_SHAPES: FamiliarShape[] = [
  {
    id: 'open-C',
    root: 0,
    type: 'major',
    frets: [X, 3, 2, 0, 1, 0],
    fingers: [X, 3, 2, 0, 1, 0],
    barres: [],
    difficulty: 'Open',
  },
  {
    id: 'open-G',
    root: 7,
    type: 'major',
    frets: [3, 2, 0, 0, 0, 3],
    fingers: [2, 1, 0, 0, 0, 3],
    barres: [],
    difficulty: 'Open',
  },
  {
    id: 'open-D',
    root: 2,
    type: 'major',
    frets: [X, X, 0, 2, 3, 2],
    fingers: [X, X, 0, 1, 3, 2],
    barres: [],
    difficulty: 'Open',
  },
  {
    id: 'open-Dm',
    root: 2,
    type: 'minor',
    frets: [X, X, 0, 2, 3, 1],
    fingers: [X, X, 0, 2, 3, 1],
    barres: [],
    difficulty: 'Open',
  },
  {
    id: 'open-D7',
    root: 2,
    type: 'dom7',
    frets: [X, X, 0, 2, 1, 2],
    fingers: [X, X, 0, 2, 1, 3],
    barres: [],
    difficulty: 'Open',
  },
  {
    id: 'open-Cmaj7',
    root: 0,
    type: 'maj7',
    frets: [X, 3, 2, 0, 0, 0],
    fingers: [X, 3, 2, 0, 0, 0],
    barres: [],
    difficulty: 'Open',
  },
  {
    id: 'open-F',
    root: 5,
    type: 'major',
    frets: [1, 3, 3, 2, 1, 1],
    fingers: [1, 3, 4, 2, 1, 1],
    barres: [{ fromString: 6, toString: 1, fret: 1, finger: 1 }],
    difficulty: 'Barre',
  },
];
