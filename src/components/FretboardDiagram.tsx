import React, { useMemo } from 'react';
import { Pressable, View } from 'react-native';
import Svg, { Circle, Line, Path, Rect, Text as SvgText } from 'react-native-svg';
import { BOARD_FRAME } from '../constants/config';
import theme from '../constants/theme';
import { accessibleDescription, noteLabelsForVoicing } from '../game/chordLibrary';
import type { Voicing } from '../game/types';
import {
  FRET_CELLS,
  boardGeometry,
  fretCenterY,
  fretLineY,
  stringX,
} from '../utils/fretboardGeometry';
import MaterialCard from './MaterialCard';
import { HIT_SLOP } from './PressScale';

const IVORY = '#EDE6D6';
const IVORY_DIM = 'rgba(237,230,214,0.70)';
const LIT = '#FFF3C4';
const STRING_WIDTHS = [2.5, 2.2, 1.9, 1.6, 1.3, 1];

interface FretboardDiagramProps {
  voicing: Voicing;
  leftHanded: boolean;
  frameWidth: number;
  cellHeight?: number;
  compact?: boolean;
  lit?: boolean[];
  onPress?: () => void;
  showNotes?: boolean;
}

const NO_LIT = [false, false, false, false, false, false];

function FretboardDiagram({
  voicing,
  leftHanded,
  frameWidth,
  cellHeight,
  compact = false,
  lit = NO_LIT,
  onPress,
  showNotes = true,
}: FretboardDiagramProps) {
  const g = useMemo(
    () => boardGeometry(frameWidth, { cellHeight, compact, showNotes }),
    [frameWidth, cellHeight, compact, showNotes],
  );
  const notes = useMemo(() => noteLabelsForVoicing(voicing), [voicing]);
  const startFret = voicing.startFret;
  const hasNut = startFret === 1;
  const gridBottom = g.gridTop + FRET_CELLS * g.cellH;
  const r = g.dotD / 2;

  const barreCovers = (stringIndex: number, fret: number) =>
    voicing.barres.some(b => {
      if (b.fret !== fret) return false;
      const a = 6 - b.fromString;
      const c = 6 - b.toString;
      return stringIndex >= Math.min(a, c) && stringIndex <= Math.max(a, c);
    });

  const body = (
    <MaterialCard material="wood" padding={BOARD_FRAME - 1} radius={theme.radius.card}>
      <Svg width={g.innerWidth} height={g.svgHeight}>
        {/* restrained grain behind the vector grid */}
        <Path
          d={
            'M0 ' +
            (g.gridTop + 12) +
            ' Q ' +
            g.innerWidth / 2 +
            ' ' +
            (g.gridTop + 2) +
            ', ' +
            g.innerWidth +
            ' ' +
            (g.gridTop + 16)
          }
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={3}
          fill="none"
        />
        <Path
          d={
            'M0 ' +
            (gridBottom - 24) +
            ' Q ' +
            g.innerWidth / 2 +
            ' ' +
            (gridBottom - 34) +
            ', ' +
            g.innerWidth +
            ' ' +
            (gridBottom - 18)
          }
          stroke="rgba(0,0,0,0.07)"
          strokeWidth={4}
          fill="none"
        />

        {/* fret lines */}
        {Array.from({ length: FRET_CELLS + 1 }).map((_, row) => (
          <Line
            key={'fret-' + row}
            x1={g.gridLeft}
            y1={fretLineY(g, row)}
            x2={g.gridLeft + g.gridWidth}
            y2={fretLineY(g, row)}
            stroke={theme.colors.surface}
            strokeWidth={2}
            opacity={row === 0 && hasNut ? 0 : 0.9}
          />
        ))}

        {/* nut */}
        {hasNut ? (
          <Rect
            x={g.gridLeft - 2}
            y={g.gridTop - g.nutH}
            width={g.gridWidth + 4}
            height={g.nutH}
            rx={2}
            fill={IVORY}
          />
        ) : null}

        {/* strings */}
        {STRING_WIDTHS.map((w, i) => {
          const x = stringX(g, i, leftHanded);
          const isLit = !!lit[i];
          return (
            <Line
              key={'string-' + i}
              x1={x}
              y1={hasNut ? g.gridTop - g.nutH : g.gridTop}
              x2={x}
              y2={gridBottom}
              stroke={isLit ? LIT : IVORY}
              strokeWidth={isLit ? w + 1.2 : w}
              opacity={voicing.frets[i] === null ? 0.45 : 1}
            />
          );
        })}

        {/* fret numbers in the outer gutter */}
        {Array.from({ length: FRET_CELLS }).map((_, row) => (
          <SvgText
            key={'num-' + row}
            x={Math.max(8, g.gridLeft / 2)}
            y={fretCenterY(g, startFret + row, startFret) + 4}
            fill={IVORY_DIM}
            fontSize={11}
            fontWeight="600"
            textAnchor="middle">
            {String(startFret + row)}
          </SvgText>
        ))}

        {/* open / muted markers */}
        {voicing.frets.map((f, i) => {
          const x = stringX(g, i, leftHanded);
          const y = g.markerBandH / 2;
          if (f === null) {
            return (
              <React.Fragment key={'mark-' + i}>
                <Line x1={x - 5} y1={y - 5} x2={x + 5} y2={y + 5} stroke={IVORY} strokeWidth={2} />
                <Line x1={x - 5} y1={y + 5} x2={x + 5} y2={y - 5} stroke={IVORY} strokeWidth={2} />
              </React.Fragment>
            );
          }
          if (f === 0) {
            return (
              <Circle key={'mark-' + i} cx={x} cy={y} r={6} stroke={IVORY} strokeWidth={2} fill="none" />
            );
          }
          return null;
        })}

        {/* barres */}
        {voicing.barres.map((b, bi) => {
          const x1 = stringX(g, 6 - b.fromString, leftHanded);
          const x2 = stringX(g, 6 - b.toString, leftHanded);
          const left = Math.min(x1, x2);
          const right = Math.max(x1, x2);
          const cy = fretCenterY(g, b.fret, startFret);
          return (
            <React.Fragment key={'barre-' + bi}>
              <Rect
                x={left - r}
                y={cy - r}
                width={right - left + g.dotD}
                height={g.dotD}
                rx={r}
                fill={theme.colors.accent}
              />
              <SvgText
                x={(left + right) / 2}
                y={cy + g.fingerFontSize * 0.36}
                fill={theme.colors.white}
                fontSize={g.fingerFontSize}
                fontWeight="700"
                textAnchor="middle">
                {String(b.finger)}
              </SvgText>
            </React.Fragment>
          );
        })}

        {/* finger positions */}
        {voicing.frets.map((f, i) => {
          if (f === null || f === 0) return null;
          if (f < startFret || f > startFret + FRET_CELLS - 1) return null;
          if (barreCovers(i, f)) return null;
          const x = stringX(g, i, leftHanded);
          const cy = fretCenterY(g, f, startFret);
          const finger = voicing.fingers[i];
          return (
            <React.Fragment key={'dot-' + i}>
              <Circle cx={x} cy={cy} r={r} fill={theme.colors.accent} />
              {finger && finger > 0 ? (
                <SvgText
                  x={x}
                  y={cy + g.fingerFontSize * 0.36}
                  fill={theme.colors.white}
                  fontSize={g.fingerFontSize}
                  fontWeight="700"
                  textAnchor="middle">
                  {String(finger)}
                </SvgText>
              ) : null}
            </React.Fragment>
          );
        })}

        {/* note strip */}
        {showNotes
          ? notes.map((n, i) =>
              n ? (
                <SvgText
                  key={'note-' + i}
                  x={stringX(g, i, leftHanded)}
                  y={gridBottom + g.labelBandH - 6}
                  fill={IVORY}
                  fontSize={12}
                  fontWeight="600"
                  textAnchor="middle">
                  {n}
                </SvgText>
              ) : null,
            )
          : null}
      </Svg>
    </MaterialCard>
  );

  if (!onPress) {
    return <View style={{ width: g.frameWidth }}>{body}</View>;
  }

  return (
    <Pressable
      style={{ width: g.frameWidth, height: g.cardHeight }}
      onPress={onPress}
      hitSlop={HIT_SLOP}
      accessibilityRole="button"
      accessibilityLabel={accessibleDescription(voicing) + ' Play chord.'}>
      {body}
    </Pressable>
  );
}

export default React.memo(FretboardDiagram);
