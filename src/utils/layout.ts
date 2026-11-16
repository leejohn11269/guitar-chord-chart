import { Dimensions } from 'react-native';
import { BOARD_MAX_W } from '../constants/config';

const win = Dimensions.get('window');

export const SCREEN_W = win.width;
export const SCREEN_H = win.height;

export const IS_TABLET = SCREEN_W >= 600;

/** 16dp side margins on phones, a centred 840dp frame on tablets. */
export const SIDE_MARGIN = IS_TABLET ? 24 : 16;
export const CONTENT_W = Math.min(SCREEN_W - 2 * SIDE_MARGIN, IS_TABLET ? 840 : SCREEN_W);

/** Leave room for the card padding and border — never 400. */
export const BOARD_W = Math.min(CONTENT_W, BOARD_MAX_W);

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
