import React from 'react';
import { Animated, Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { Guitar, ListMusic, Music, Timer } from 'lucide-react-native';
import { TAB_BAR_H } from '../constants/config';
import theme from '../constants/theme';
import type { IconComponent } from './Buttons';
import { HIT_SLOP, usePressScale } from './PressScale';

export type TabKey = 'finder' | 'sheets' | 'tones' | 'practice';

const TABS: Array<{ key: TabKey; label: string; Icon: IconComponent }> = [
  { key: 'finder', label: 'Finder', Icon: Guitar },
  { key: 'sheets', label: 'Sheets', Icon: ListMusic },
  { key: 'tones', label: 'Tones', Icon: Music },
  { key: 'practice', label: 'Practice', Icon: Timer },
];

const TAB_W = Math.floor(Dimensions.get('window').width / 4);

function Tab({
  label,
  Icon,
  active,
  onPress,
}: {
  label: string;
  Icon: IconComponent;
  active: boolean;
  onPress: () => void;
}) {
  const { scale, onPressIn, onPressOut } = usePressScale(0.94);
  const color = active ? theme.colors.accent : theme.colors.textSecondary;

  return (
    <Pressable
      style={styles.tabPress}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      hitSlop={HIT_SLOP}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label + ' tab'}>
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.tabInner,
          { transform: [{ scale }] },
          active ? styles.tabInnerActive : null,
        ]}>
        <Icon size={24} color={color} strokeWidth={active ? 2.6 : 2} />
        <Text style={[styles.tabLabel, { color }]} numberOfLines={1}>
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

export default function BottomTabs({
  activeTab,
  onSelect,
}: {
  activeTab: TabKey;
  onSelect: (key: TabKey) => void;
}) {
  return (
    <View style={styles.root}>
      {TABS.map(t => (
        <Tab
          key={t.key}
          label={t.label}
          Icon={t.Icon}
          active={activeTab === t.key}
          onPress={() => onSelect(t.key)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    height: TAB_BAR_H,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.secondary,
    paddingHorizontal: 4,
    paddingBottom: 6,
    ...theme.shadow.panel,
  },
  tabPress: { width: TAB_W - 2, height: 60, alignItems: 'center', justifyContent: 'center' },
  tabInner: {
    width: TAB_W - 10,
    height: 56,
    borderRadius: theme.radius.tile,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  tabInnerActive: {
    backgroundColor: theme.colors.secondary,
  },
  tabLabel: { fontSize: 12, lineHeight: 16, fontWeight: '700' },
});
