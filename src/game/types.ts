export type ChordTypeId =
  | 'major'
  | 'minor'
  | 'dom7'
  | 'maj7'
  | 'min7'
  | 'sus2'
  | 'sus4'
  | 'dim';

export type Family = 'E' | 'A' | 'open';

/** null = muted string, 0 = open, n = fretted. Order: low E, A, D, G, B, high e. */
export type FretValue = number | null;

export interface Barre {
  /** canonical string numbers, 6 = low E, 1 = high e */
  fromString: number;
  toString: number;
  fret: number;
  finger: number;
}

export interface Voicing {
  id: string;
  root: number;
  type: ChordTypeId;
  family: Family;
  frets: FretValue[];
  fingers: FretValue[];
  barres: Barre[];
  startFret: number;
  positionLabel: string;
  difficulty: 'Open' | 'Barre' | 'Stretch';
}

export interface ChordTypeDef {
  id: ChordTypeId;
  label: string;
  spoken: string;
  suffix: string;
  intervals: number[];
}

export interface SheetEntry {
  id: string;
  root: number;
  type: ChordTypeId;
  voicingId: string;
  snapshot: Voicing;
}

export interface Sheet {
  id: string;
  title: string;
  createdAt: number;
  entries: SheetEntry[];
}

export interface PracticeSetup {
  voicings: Voicing[];
  bpm: number;
  durationSec: number;
  referenceOnChange: boolean;
}

export interface PracticeSummary {
  sessionId: string;
  finishedAt: number;
  chordNames: string[];
  bpm: number;
  plannedSec: number;
  activeSec: number;
  completed: number;
  opportunities: number;
  reason: 'elapsed' | 'finished';
}
