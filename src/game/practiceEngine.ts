import { BEATS_PER_BLOCK } from '../constants/config';

export function beatIntervalMs(bpm: number): number {
  return 60000 / bpm;
}

export function blockMs(bpm: number): number {
  return beatIntervalMs(bpm) * BEATS_PER_BLOCK;
}

/** Index of the chord block an active session is currently inside. */
export function blockIndexAt(activeMs: number, bpm: number): number {
  return Math.floor(activeMs / blockMs(bpm));
}

/** Beat within the current block, 0..3. */
export function beatIndexAt(activeMs: number, bpm: number): number {
  const b = beatIntervalMs(bpm);
  return Math.floor(activeMs / b) % BEATS_PER_BLOCK;
}

/**
 * Blocks after the warm-up that started strictly before the session end.
 * Block 0 is the warm-up and never counts.
 */
export function opportunitiesFor(activeMs: number, bpm: number): number {
  return Math.max(0, Math.ceil(activeMs / blockMs(bpm)) - 1);
}

export function completionPercent(completed: number, opportunities: number): number | null {
  if (opportunities <= 0) return null;
  return Math.round((100 * completed) / opportunities);
}

export function formatClock(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
}
