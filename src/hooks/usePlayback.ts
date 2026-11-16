import { useCallback, useEffect, useRef, useState } from 'react';
import { STRING_DECAY_MS, STRUM_STAGGER_MS } from '../constants/config';
import { strumOrder } from '../game/chordLibrary';
import type { Voicing } from '../game/types';

export interface PlaybackState {
  /** id of the voicing currently sounding, or null */
  activeId: string | null;
  /** one flag per string, low E first */
  lit: boolean[];
}

const OFF: boolean[] = [false, false, false, false, false, false];

export interface PlaybackApi {
  state: PlaybackState;
  isPlaying: (voicingId: string) => boolean;
  play: (voicing: Voicing, direction: 'down' | 'up') => void;
  toggle: (voicing: Voicing, direction: 'down' | 'up') => void;
  stop: () => void;
}

/**
 * Drives the visual strum: strings light low-to-high (or reversed) with the
 * documented stagger and decay. Timers live in refs and are cleared on unmount.
 */
export function usePlayback(): PlaybackApi {
  const [state, setState] = useState<PlaybackState>({ activeId: null, lit: OFF });
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const mounted = useRef(true);

  const clearTimers = useCallback(() => {
    timers.current.forEach(t => clearTimeout(t));
    timers.current = [];
  }, []);

  const stop = useCallback(() => {
    clearTimers();
    if (mounted.current) setState({ activeId: null, lit: OFF });
  }, [clearTimers]);

  const play = useCallback(
    (voicing: Voicing, direction: 'down' | 'up') => {
      clearTimers();
      const order = strumOrder(voicing, direction);
      if (order.length === 0) return;

      setState({ activeId: voicing.id, lit: OFF });

      order.forEach((stringIndex, step) => {
        timers.current.push(
          setTimeout(() => {
            if (!mounted.current) return;
            setState(prev => {
              const lit = prev.lit.slice();
              lit[stringIndex] = true;
              return { activeId: voicing.id, lit };
            });
          }, step * STRUM_STAGGER_MS),
        );
        timers.current.push(
          setTimeout(() => {
            if (!mounted.current) return;
            setState(prev => {
              const lit = prev.lit.slice();
              lit[stringIndex] = false;
              return { activeId: prev.activeId, lit };
            });
          }, step * STRUM_STAGGER_MS + STRING_DECAY_MS),
        );
      });

      const tail = (order.length - 1) * STRUM_STAGGER_MS + STRING_DECAY_MS + 40;
      timers.current.push(
        setTimeout(() => {
          if (!mounted.current) return;
          setState({ activeId: null, lit: OFF });
        }, tail),
      );
    },
    [clearTimers],
  );

  const toggle = useCallback(
    (voicing: Voicing, direction: 'down' | 'up') => {
      if (state.activeId === voicing.id) stop();
      else play(voicing, direction);
    },
    [play, state.activeId, stop],
  );

  const isPlaying = useCallback((voicingId: string) => state.activeId === voicingId, [
    state.activeId,
  ]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      timers.current.forEach(t => clearTimeout(t));
      timers.current = [];
    };
  }, []);

  return { state, isPlaying, play, toggle, stop };
}
