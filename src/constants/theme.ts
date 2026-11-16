/**
 * WARM_EARTHY preset with the brief's exact colour overrides.
 * The preset identity (`name`) stays untouched.
 */
export const theme = {
  name: 'warm-earthy',

  colors: {
    background: '#EEF6ED',
    primary: '#2EAB2A',
    accent: '#2832E0',
    accentDeep: '#2028B3',
    textPrimary: '#182418',
    secondary: '#B0DDC4',
    surface: '#FFFFFF',
    cream: '#F2EAD8',
    woodLight: '#9B7048',
    woodDark: '#6F4A2F',
    textSecondary: '#405840',
    textMuted: '#526A56',
    danger: '#C2492B',
    white: '#FFFFFF',
  },

  alpha: {
    scrim: 'rgba(24, 36, 24, 0.55)',
    hairline: 'rgba(24, 36, 24, 0.10)',
    materialTop: 'rgba(255, 255, 255, 0.72)',
    woodEdge: 'rgba(111, 74, 47, 0.55)',
    greenWash: 'rgba(46, 171, 42, 0.12)',
    accentWash: 'rgba(40, 50, 224, 0.10)',
    trackLight: 'rgba(255, 255, 255, 0.20)',
  },

  gradients: {
    // Screen overlays — every screen shares bg_game and differs by its overlay.
    loader: ['#182418', '#2C3A26', '#6F4A2F'] as const,
    finder: ['#EEF6ED', '#D9EDDD', '#B0DDC4'] as const,
    diagram: ['#EEF6ED', '#F4F0E2', '#F2EAD8'] as const,
    sheets: ['#F2EAD8', '#F1F3E6', '#EEF6ED'] as const,
    tones: ['#EEF6ED', '#CDE6D6', '#B0DDC4'] as const,
    practice: ['#EEF6ED', '#F0F1E4', '#F2EAD8'] as const,
    result: ['#B0DDC4', '#D4ECD9', '#EEF6ED'] as const,
    settings: ['#EEF6ED', '#F3F1E6', '#F2EAD8'] as const,

    // Material surfaces
    primaryButton: ['#2832E0', '#2028B3'] as const,
    greenPanel: ['#49C244', '#2EAB2A'] as const,
    wood: ['#A87C50', '#9B7048', '#7E5939', '#6F4A2F'] as const,
    paper: ['#FFFFFF', '#F7F8F3'] as const,
  },

  radius: { tile: 14, card: 16, panel: 18, pill: 999 },

  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 },

  type: {
    hero: { fontSize: 40, lineHeight: 46, fontWeight: '700' as const, letterSpacing: -0.5 },
    pageTitle: { fontSize: 26, lineHeight: 32, fontWeight: '700' as const },
    cardTitle: { fontSize: 22, lineHeight: 28, fontWeight: '600' as const },
    button: { fontSize: 17, lineHeight: 24, fontWeight: '700' as const },
    body: { fontSize: 16, lineHeight: 23, fontWeight: '400' as const },
    meta: { fontSize: 14, lineHeight: 20, fontWeight: '500' as const },
    caption: { fontSize: 12, lineHeight: 16, fontWeight: '500' as const, letterSpacing: 0.8 },
  },

  shadow: {
    card: {
      shadowColor: '#182418',
      shadowOpacity: 0.1,
      shadowOffset: { width: 0, height: 3 },
      shadowRadius: 8,
      elevation: 2,
    },
    wood: {
      shadowColor: '#182418',
      shadowOpacity: 0.14,
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 10,
      elevation: 4,
    },
    primary: {
      shadowColor: '#2832E0',
      shadowOpacity: 0.2,
      shadowOffset: { width: 0, height: 3 },
      shadowRadius: 8,
      elevation: 3,
    },
    panel: {
      shadowColor: '#182418',
      shadowOpacity: 0.12,
      shadowOffset: { width: 0, height: -2 },
      shadowRadius: 12,
      elevation: 6,
    },
  },
};

export type Theme = typeof theme;
export default theme;
