import {
  A_FAMILY,
  CHORD_TYPES,
  CHORD_TYPE_MAP,
  E_FAMILY,
  FAMILIAR_SHAPES,
  ROOTS,
  ROOTS_SHORT,
} from './chordTemplates';
import type { Barre, ChordTypeId, FretValue, Voicing } from './types';

/** Standard tuning, low E -> high e. */
export const STRING_MIDI = [40, 45, 50, 55, 59, 64];

const SHARP_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const FLAT_ROOTS = [3, 8, 10];

export function chordName(root: number, type: ChordTypeId): string {
  return ROOTS_SHORT[root] + CHORD_TYPE_MAP[type].suffix;
}

export function chordSpoken(root: number, type: ChordTypeId): string {
  return ROOTS_SHORT[root] + ' ' + CHORD_TYPE_MAP[type].spoken;
}

export function noteName(pitchClass: number, root: number): string {
  return FLAT_ROOTS.indexOf(root) >= 0 ? FLAT_NAMES[pitchClass] : SHARP_NAMES[pitchClass];
}

export function midiForString(index: number, fret: number): number {
  return STRING_MIDI[index] + fret;
}

export function frequencyForMidi(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export function noteLabelsForVoicing(v: Voicing): string[] {
  return v.frets.map((f, i) =>
    f === null ? '' : noteName(midiForString(i, f) % 12, v.root),
  );
}

/** Every sounded pitch class belongs to the chord, and every interval occurs. */
function validate(frets: FretValue[], root: number, type: ChordTypeId): boolean {
  const intervals = CHORD_TYPE_MAP[type].intervals;
  const seen: number[] = [];
  let sounded = 0;
  for (let i = 0; i < 6; i++) {
    const f = frets[i];
    if (f === null) continue;
    if (f < 0 || f > 15) return false;
    sounded++;
    const interval = ((((midiForString(i, f) % 12) - root) % 12) + 12) % 12;
    if (intervals.indexOf(interval) < 0) return false;
    if (seen.indexOf(interval) < 0) seen.push(interval);
  }
  if (sounded < 3) return false;
  return intervals.every(iv => seen.indexOf(iv) >= 0);
}

function positiveFrets(frets: FretValue[]): number[] {
  return frets.filter((f): f is number => f !== null && f > 0);
}

export function startFretFor(frets: FretValue[]): number {
  const pos = positiveFrets(frets);
  if (pos.length === 0) return 1;
  const max = pos.reduce((a, b) => (b > a ? b : a), pos[0]);
  if (max <= 5) return 1;
  return pos.reduce((a, b) => (b < a ? b : a), pos[0]);
}

function positionLabel(frets: FretValue[]): string {
  const hasOpen = frets.some(f => f === 0);
  if (hasOpen) return 'Open position';
  const pos = positiveFrets(frets);
  const min = pos.length ? pos.reduce((a, b) => (b < a ? b : a), pos[0]) : 1;
  return 'Fret ' + min;
}

function buildFamilyVoicing(
  root: number,
  type: ChordTypeId,
  family: 'E' | 'A',
): Voicing | null {
  const tpl = family === 'E' ? E_FAMILY[type] : A_FAMILY[type];
  const anchor = family === 'E' ? 4 : 9;
  const shift = (((root - anchor) % 12) + 12) % 12;

  const frets: FretValue[] = tpl.frets.map(f => (f === null ? null : f + shift));
  const fingers: FretValue[] = shift === 0 ? tpl.openFingers.slice() : tpl.shiftedFingers.slice();

  const barres: Barre[] = [];
  if (shift > 0) {
    if (tpl.baseBarre) {
      barres.push({
        fromString: tpl.baseBarre[0],
        toString: tpl.baseBarre[1],
        fret: shift,
        finger: 1,
      });
    }
    if (tpl.extraBarre) {
      barres.push({
        fromString: tpl.extraBarre[0],
        toString: tpl.extraBarre[1],
        fret: shift + tpl.extraBarre[2],
        finger: tpl.extraBarre[3],
      });
    }
  }

  if (!validate(frets, root, type)) return null;

  let difficulty: Voicing['difficulty'] = 'Open';
  if (family === 'E' && type === 'sus2') difficulty = 'Stretch';
  else if (shift > 0) difficulty = 'Barre';

  return {
    id: 'fam-' + family + '-' + root + '-' + type,
    root,
    type,
    family,
    frets,
    fingers,
    barres,
    startFret: startFretFor(frets),
    positionLabel: positionLabel(frets),
    difficulty,
  };
}

function sortVoicings(list: Voicing[]): Voicing[] {
  return list.slice().sort((a, b) => {
    const aOpen = a.family === 'open' ? 0 : 1;
    const bOpen = b.family === 'open' ? 0 : 1;
    if (aOpen !== bOpen) return aOpen - bOpen;

    const aPos = positiveFrets(a.frets);
    const bPos = positiveFrets(b.frets);
    const aMin = aPos.length ? aPos.reduce((x, y) => (y < x ? y : x), aPos[0]) : 0;
    const bMin = bPos.length ? bPos.reduce((x, y) => (y < x ? y : x), bPos[0]) : 0;
    if (aMin !== bMin) return aMin - bMin;

    const aMax = aPos.length ? aPos.reduce((x, y) => (y > x ? y : x), aPos[0]) : 0;
    const bMax = bPos.length ? bPos.reduce((x, y) => (y > x ? y : x), bPos[0]) : 0;
    if (aMax !== bMax) return aMax - bMax;

    if (a.barres.length !== b.barres.length) return a.barres.length - b.barres.length;
    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
  });
}

const TYPE_INDEX: Record<ChordTypeId, number> = CHORD_TYPES.reduce(
  (acc, t, i) => {
    acc[t.id] = i;
    return acc;
  },
  {} as Record<ChordTypeId, number>,
);

/** root -> type -> ordered shapes. Built once at module load. */
const LIBRARY: Voicing[][][] = (function buildLibrary() {
  const table: Voicing[][][] = [];
  for (let root = 0; root < 12; root++) {
    const perType: Voicing[][] = [];
    for (let t = 0; t < CHORD_TYPES.length; t++) {
      const type = CHORD_TYPES[t].id;
      const collected: Voicing[] = [];
      const seen: string[] = [];

      FAMILIAR_SHAPES.forEach(shape => {
        if (shape.root !== root || shape.type !== type) return;
        if (!validate(shape.frets, root, type)) return;
        const key = shape.frets.join(',');
        if (seen.indexOf(key) >= 0) return;
        seen.push(key);
        collected.push({
          id: shape.id,
          root,
          type,
          family: 'open',
          frets: shape.frets,
          fingers: shape.fingers,
          barres: shape.barres,
          startFret: startFretFor(shape.frets),
          positionLabel: positionLabel(shape.frets),
          difficulty: shape.difficulty,
        });
      });

      const families: Array<'E' | 'A'> = ['E', 'A'];
      families.forEach(family => {
        const v = buildFamilyVoicing(root, type, family);
        if (!v) return;
        const key = v.frets.join(',');
        if (seen.indexOf(key) >= 0) return;
        seen.push(key);
        collected.push(v);
      });

      perType.push(sortVoicings(collected));
    }
    table.push(perType);
  }
  return table;
})();

export function getShapes(root: number, type: ChordTypeId): Voicing[] {
  const safeRoot = ((root % 12) + 12) % 12;
  return LIBRARY[safeRoot][TYPE_INDEX[type]];
}

export function getVoicingById(id: string): Voicing | null {
  for (let r = 0; r < 12; r++) {
    for (let t = 0; t < CHORD_TYPES.length; t++) {
      const list = LIBRARY[r][t];
      for (let i = 0; i < list.length; i++) {
        if (list[i].id === id) return list[i];
      }
    }
  }
  return null;
}

/** The app's opening selection: C major, familiar open shape. */
export function defaultVoicing(): Voicing {
  return getShapes(0, 'major')[0];
}

export function fingeringSentence(v: Voicing): string {
  const names = ['low E', 'A', 'D', 'G', 'B', 'high e'];
  const fingerWord = ['', 'index', 'middle', 'ring', 'little finger'];
  const parts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const f = v.frets[i];
    if (f === null) {
      parts.push(names[i] + ' muted');
    } else if (f === 0) {
      parts.push(names[i] + ' open');
    } else {
      const finger = v.fingers[i];
      const word = finger && finger > 0 ? ', ' + fingerWord[finger] : '';
      parts.push(names[i] + ' fret ' + f + word);
    }
  }
  return parts.join('. ') + '.';
}

export function accessibleDescription(v: Voicing): string {
  return chordSpoken(v.root, v.type) + '. ' + fingeringSentence(v);
}

/** Sounded string indexes in strum order. */
export function strumOrder(v: Voicing, direction: 'down' | 'up'): number[] {
  const sounded: number[] = [];
  for (let i = 0; i < 6; i++) {
    if (v.frets[i] !== null) sounded.push(i);
  }
  return direction === 'down' ? sounded : sounded.slice().reverse();
}

export { CHORD_TYPES, CHORD_TYPE_MAP, ROOTS, ROOTS_SHORT };
