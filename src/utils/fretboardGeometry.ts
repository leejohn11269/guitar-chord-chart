import {
  BOARD_FRAME,
  BOARD_MAX_W,
  BOARD_SIDE_GUTTER,
  DOT_D,
  FRET_CELL_H,
  FRET_CELL_H_COMPACT,
  LABEL_BAND_H,
  MARKER_BAND_H,
  NUT_H,
} from '../constants/config';

export interface BoardGeometry {
  /** outer card width, padding + border included */
  frameWidth: number;
  /** drawable width inside the card padding and border */
  innerWidth: number;
  gridLeft: number;
  gridWidth: number;
  stringSpacing: number;
  cellH: number;
  markerBandH: number;
  labelBandH: number;
  nutH: number;
  gridTop: number;
  svgHeight: number;
  /** outer card height, frame included */
  cardHeight: number;
  dotD: number;
  fingerFontSize: number;
  cellCount: number;
}

export const FRET_CELLS = 5;

export interface BoardOptions {
  /** explicit fret-cell height; falls back to the compact/standard constants */
  cellHeight?: number;
  compact?: boolean;
  showNotes?: boolean;
}

export function clampCellHeight(value: number): number {
  return Math.max(18, Math.min(FRET_CELL_H, Math.floor(value)));
}

/** Vertical space a board needs around its five fret cells. */
export function boardChromeHeight(showNotes: boolean): number {
  return 2 * BOARD_FRAME + MARKER_BAND_H + NUT_H + (showNotes ? LABEL_BAND_H : 8);
}

/**
 * The parent card's width does NOT include its padding for the child content area,
 * so the frame (padding + border) is subtracted before the grid is laid out.
 */
export function boardGeometry(contentWidth: number, options: BoardOptions = {}): BoardGeometry {
  const showNotes = options.showNotes !== false;
  const frameWidth = Math.floor(Math.min(contentWidth, BOARD_MAX_W));
  const innerWidth = frameWidth - 2 * BOARD_FRAME;
  const usable = innerWidth - 2 * BOARD_SIDE_GUTTER;
  const stringSpacing = Math.max(14, Math.floor(usable / 5));
  const gridWidth = stringSpacing * 5;
  const gridLeft = Math.floor((innerWidth - gridWidth) / 2);

  const cellH = clampCellHeight(
    options.cellHeight !== undefined
      ? options.cellHeight
      : options.compact
      ? FRET_CELL_H_COMPACT
      : FRET_CELL_H,
  );

  const labelBandH = showNotes ? LABEL_BAND_H : 8;
  const gridTop = MARKER_BAND_H + NUT_H;
  const svgHeight = gridTop + FRET_CELLS * cellH + labelBandH;

  /** markers must never overlap: cap the dot to the string spacing and the cell. */
  const dotD = Math.max(
    14,
    Math.min(DOT_D, stringSpacing - 2, cellH - 4),
  );

  return {
    frameWidth,
    innerWidth,
    gridLeft,
    gridWidth,
    stringSpacing,
    cellH,
    markerBandH: MARKER_BAND_H,
    labelBandH,
    nutH: NUT_H,
    gridTop,
    svgHeight,
    cardHeight: svgHeight + 2 * BOARD_FRAME,
    dotD,
    fingerFontSize: Math.max(9, Math.round(dotD * 0.58)),
    cellCount: FRET_CELLS,
  };
}

/** x of a string, mirrored for left-handed players. Index 0 is the low E. */
export function stringX(g: BoardGeometry, index: number, leftHanded: boolean): number {
  const slot = leftHanded ? 5 - index : index;
  return g.gridLeft + slot * g.stringSpacing;
}

/** y of the centre of a fret cell. `fret` is absolute; `startFret` is the window top. */
export function fretCenterY(g: BoardGeometry, fret: number, startFret: number): number {
  const row = fret - startFret;
  return g.gridTop + row * g.cellH + g.cellH / 2;
}

/** y of the line that closes a fret cell. */
export function fretLineY(g: BoardGeometry, row: number): number {
  return g.gridTop + row * g.cellH;
}
