/**
 * @format
 * Chord library contract: every root and type resolves to real, playable shapes.
 */
import { expect, it } from '@jest/globals';
import { CHORD_TYPES, chordName, getShapes, midiForString } from '../src/game/chordLibrary';
import { CHORD_TYPE_MAP } from '../src/game/chordTemplates';

it('ships at least two validated shapes for every root and type', () => {
  for (let root = 0; root < 12; root++) {
    CHORD_TYPES.forEach(type => {
      const shapes = getShapes(root, type.id);
      expect(shapes.length).toBeGreaterThanOrEqual(2);

      shapes.forEach(shape => {
        const intervals = CHORD_TYPE_MAP[type.id].intervals;
        const seen: number[] = [];
        shape.frets.forEach((fret, i) => {
          if (fret === null) return;
          const interval = ((((midiForString(i, fret) % 12) - root) % 12) + 12) % 12;
          expect(intervals).toContain(interval);
          if (seen.indexOf(interval) < 0) seen.push(interval);
        });
        intervals.forEach(iv => expect(seen).toContain(iv));

        // every fretted note fits the five-cell window the diagram draws
        shape.frets.forEach(fret => {
          if (fret === null || fret === 0) return;
          expect(fret).toBeGreaterThanOrEqual(shape.startFret);
          expect(fret).toBeLessThanOrEqual(shape.startFret + 4);
        });
      });
    });
  }
});

it('opens on the familiar C major shape', () => {
  const first = getShapes(0, 'major')[0];
  expect(chordName(0, 'major')).toBe('C');
  expect(first.frets).toEqual([null, 3, 2, 0, 1, 0]);
});
