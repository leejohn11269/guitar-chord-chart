import React, { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import assets from '../assets';
import MaterialBackground from '../components/MaterialBackground';
import { LOADER_DURATION_MS } from '../constants/config';
import theme from '../constants/theme';

const BAR_W = 180;

export default function LoaderScreen({ onDone }: { onDone: () => void }) {
  const enter = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(0)).current;
  const done = useRef(onDone);
  done.current = onDone;

  useEffect(() => {
    Animated.timing(enter, {
      toValue: 1,
      duration: 180,
      useNativeDriver: true,
    }).start();

    // width cannot run on the native driver
    Animated.timing(progress, {
      toValue: BAR_W,
      duration: LOADER_DURATION_MS,
      useNativeDriver: false,
    }).start();

    const t = setTimeout(() => done.current(), LOADER_DURATION_MS);
    return () => clearTimeout(t);
  }, [enter, progress]);

  const scale = enter.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] });

  return (
    <MaterialBackground variant="loader">
      <View style={styles.root}>
        <Animated.View
          pointerEvents="box-none"
          style={[styles.brandCard, { opacity: enter, transform: [{ scale }] }]}>
          <LinearGradient
            colors={['rgba(255,255,255,0.14)', 'rgba(255,255,255,0.04)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.brandFill}>
            <Image source={assets.logo} style={styles.logo} resizeMode="contain" />
          </LinearGradient>
        </Animated.View>

        <Animated.Text style={[styles.title, { opacity: enter }]} accessibilityRole="header">
          Guitar Chord Chart
        </Animated.Text>
        <Text style={styles.subtitle}>Find your next chord.</Text>

        <View style={styles.track}>
          <Animated.View style={[styles.fill, { width: progress }]} />
        </View>

        <Text style={styles.loading}>LOADING...</Text>
        <Text style={styles.hint}>Loading your chord library</Text>
      </View>
    </MaterialBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  brandCard: {
    width: 160,
    height: 160,
    borderRadius: 36,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    overflow: 'hidden',
    marginBottom: 28,
  },
  brandFill: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logo: { width: 112, height: 112 },
  title: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '700',
    color: theme.colors.white,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 23,
    fontWeight: '400',
    color: theme.colors.background,
    textAlign: 'center',
    marginTop: 8,
  },
  track: {
    width: BAR_W,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.20)',
    overflow: 'hidden',
    marginTop: 36,
  },
  fill: {
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.accent,
  },
  loading: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    letterSpacing: 2,
    color: theme.colors.white,
    marginTop: 18,
  },
  hint: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    color: theme.colors.secondary,
    marginTop: 6,
  },
});
