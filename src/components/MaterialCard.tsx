import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import theme from '../constants/theme';

export type Material = 'paper' | 'wood' | 'green' | 'mint';

interface MaterialCardProps {
  children: React.ReactNode;
  material?: Material;
  padding?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Skeuomorphic surface: solid material, fine edge, top highlight and a soft shadow.
 */
export default function MaterialCard({
  children,
  material = 'paper',
  padding = 16,
  radius = theme.radius.card,
  style,
}: MaterialCardProps) {
  const isWood = material === 'wood';
  const colors =
    material === 'wood'
      ? (theme.gradients.wood as unknown as string[])
      : material === 'green'
      ? (theme.gradients.greenPanel as unknown as string[])
      : material === 'mint'
      ? ['#D8EEE0', '#B0DDC4']
      : (theme.gradients.paper as unknown as string[]);

  return (
    <View
      style={[
        styles.shell,
        isWood ? theme.shadow.wood : theme.shadow.card,
        {
          borderRadius: radius,
          borderColor: isWood ? theme.colors.woodDark : theme.colors.secondary,
        },
        style,
      ]}>
      <LinearGradient
        colors={colors}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={[styles.fill, { borderRadius: radius - 1, padding }]}>
        <View
          pointerEvents="none"
          style={[
            styles.highlight,
            {
              borderTopLeftRadius: radius - 1,
              borderTopRightRadius: radius - 1,
              backgroundColor: isWood ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.45)',
            },
          ]}
        />
        {children}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  fill: { width: '100%' },
  highlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 10,
  },
});
