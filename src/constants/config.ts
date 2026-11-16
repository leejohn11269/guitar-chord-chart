/** Pipeline splash contract — must stay at 8000ms. */
export const LOADER_DURATION_MS = 8000;

export const FADE_MS = 180;
export const CONTENT_SWAP_MS = 150;
export const TOAST_MS = 1600;

/** Layout invariants */
export const TOP_PAD = 44;
export const HEADER_H = 72;
export const TAB_BAR_H = 64;
export const BOARD_MAX_W = 380;
/** 16dp inner padding + 1dp border of the fretboard card. */
export const BOARD_FRAME = 17;
export const BOARD_SIDE_GUTTER = 20;

/** Diagram vertical metrics */
export const FRET_CELL_H = 40;
export const FRET_CELL_H_COMPACT = 32;
export const MARKER_BAND_H = 24;
export const LABEL_BAND_H = 24;
export const NUT_H = 5;
export const DOT_D = 24;

/** Playback (visual strum feedback) */
export const STRUM_STAGGER_MS = 35;
export const STRING_DECAY_MS = 1400;
export const SHEET_STEP_MS = 2000;
export const TONE_MS = 2000;

/** Practice */
export const BPM_MIN = 30;
export const BPM_MAX = 120;
export const BPM_STEP = 5;
export const BPM_DEFAULT = 60;
export const DURATION_CHOICES = [30, 60, 120] as const;
export const DURATION_DEFAULT = 60;
export const BEATS_PER_BLOCK = 4;
export const MAX_PRACTICE_CHORDS = 8;
export const MIN_PRACTICE_CHORDS = 2;

/** Library limits */
export const MAX_SHEETS = 50;
export const MAX_ENTRIES_PER_SHEET = 200;
