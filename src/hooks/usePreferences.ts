import { useCallback, useState } from 'react';
import { Vibration } from 'react-native';

export interface Preferences {
  leftHanded: boolean;
  strumDirection: 'down' | 'up';
  previewVolume: number;
  saveHaptics: boolean;
  beatHaptics: boolean;
  reduceMotion: boolean;
}

export const DEFAULT_PREFERENCES: Preferences = {
  leftHanded: false,
  strumDirection: 'down',
  previewVolume: 0.75,
  saveHaptics: true,
  beatHaptics: false,
  reduceMotion: false,
};

export interface PreferencesApi {
  prefs: Preferences;
  setPref: <K extends keyof Preferences>(key: K, value: Preferences[K]) => void;
  resetPrefs: () => void;
  tapHaptic: () => void;
}

/**
 * Preferences live in memory for this release; every change is applied immediately
 * to diagrams, the tuner and practice.
 */
export function usePreferences(): PreferencesApi {
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFERENCES);

  const setPref = useCallback(
    <K extends keyof Preferences>(key: K, value: Preferences[K]) => {
      setPrefs(prev => ({ ...prev, [key]: value }));
    },
    [],
  );

  const resetPrefs = useCallback(() => setPrefs(DEFAULT_PREFERENCES), []);

  const tapHaptic = useCallback(() => {
    if (!prefs.saveHaptics) return;
    Vibration.vibrate(10);
  }, [prefs.saveHaptics]);

  return { prefs, setPref, resetPrefs, tapHaptic };
}
