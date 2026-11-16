import React from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import assets from '../assets';
import theme from '../constants/theme';

export type BackgroundVariant =
  | 'loader'
  | 'finder'
  | 'diagram'
  | 'sheets'
  | 'tones'
  | 'practice'
  | 'result'
  | 'settings';

const OVERLAY_OPACITY: Record<BackgroundVariant, number> = {
  loader: 0.94,
  finder: 0.96,
  diagram: 0.94,
  sheets: 0.96,
  tones: 0.95,
  practice: 0.95,
  result: 0.94,
  settings: 0.97,
};

const DECOR_COLOR: Record<BackgroundVariant, string> = {
  loader: 'rgba(255,255,255,0.08)',
  finder: 'rgba(46,171,42,0.05)',
  diagram: 'rgba(111,74,47,0.04)',
  sheets: 'rgba(111,74,47,0.04)',
  tones: 'rgba(40,50,224,0.05)',
  practice: 'rgba(46,171,42,0.04)',
  result: 'rgba(46,171,42,0.06)',
  settings: 'rgba(46,171,42,0.04)',
};

/** Six quiet string curves — decoration only, never over a heading. */
function StringDecor({ color }: { color: string }) {
  return (
    <Svg style={StyleSheet.absoluteFill} viewBox="0 0 360 780" preserveAspectRatio="none">
      <Path d="M0 96 C 120 62, 240 132, 360 88" stroke={color} strokeWidth={2} fill="none" />
      <Path d="M0 150 C 120 116, 240 186, 360 142" stroke={color} strokeWidth={2} fill="none" />
      <Path d="M0 204 C 120 170, 240 240, 360 196" stroke={color} strokeWidth={2} fill="none" />
      <Path d="M0 612 C 120 578, 240 648, 360 604" stroke={color} strokeWidth={2} fill="none" />
      <Path d="M0 664 C 120 630, 240 700, 360 656" stroke={color} strokeWidth={2} fill="none" />
      <Path d="M0 716 C 120 682, 240 752, 360 708" stroke={color} strokeWidth={2} fill="none" />
    </Svg>
  );
}

export default function MaterialBackground({
  variant,
  children,
}: {
  variant: BackgroundVariant;
  children: React.ReactNode;
}) {
  const colors = theme.gradients[variant] as unknown as string[];

  return (
    <ImageBackground source={assets.bgGame} style={styles.root} resizeMode="cover">
      <LinearGradient
        colors={colors}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={[StyleSheet.absoluteFill, { opacity: OVERLAY_OPACITY[variant] }]}
      />
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <StringDecor color={DECOR_COLOR[variant]} />
      </View>
      <View style={styles.content}>{children}</View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.background },
  content: { flex: 1 },
});
