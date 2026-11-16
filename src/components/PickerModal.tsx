import React from 'react';
import { Animated, Dimensions, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Check, X } from 'lucide-react-native';
import theme from '../constants/theme';
import { IconButton } from './Buttons';
import { HIT_SLOP, usePressScale } from './PressScale';

export interface PickerOption {
  id: string;
  label: string;
  spoken?: string;
  sub?: string;
}

interface PickerModalProps {
  visible: boolean;
  title: string;
  options: PickerOption[];
  selectedId: string;
  columns: number;
  onSelect: (id: string) => void;
  onClose: () => void;
}

function Cell({
  option,
  selected,
  width,
  onPress,
}: {
  option: PickerOption;
  selected: boolean;
  width: number;
  onPress: () => void;
}) {
  const { scale, onPressIn, onPressOut } = usePressScale(0.96);

  return (
    <Pressable
      style={{ width, height: 60 }}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      hitSlop={HIT_SLOP}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={option.spoken || option.label}>
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.cell,
          {
            transform: [{ scale }],
            borderColor: selected ? theme.colors.accent : theme.colors.secondary,
            borderWidth: selected ? 2 : 1,
            backgroundColor: selected ? theme.alpha.accentWash : theme.colors.surface,
          },
        ]}>
        <Text
          style={[
            styles.cellLabel,
            { color: selected ? theme.colors.accent : theme.colors.textPrimary },
          ]}
          numberOfLines={1}>
          {option.label}
        </Text>
        {selected ? (
          <View style={styles.checkWrap}>
            <Check size={14} color={theme.colors.accent} strokeWidth={3} />
          </View>
        ) : null}
      </Animated.View>
    </Pressable>
  );
}

export default function PickerModal({
  visible,
  title,
  options,
  selectedId,
  columns,
  onSelect,
  onClose,
}: PickerModalProps) {
  const gap = 10;
  const sheetPadding = 16;
  const winW = Math.min(Dimensions.get('window').width, 420);
  const available = winW - 2 * 16 - 2 * sheetPadding;
  const cellWidth = Math.floor((available - gap * (columns - 1)) / columns);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent>
      <View style={styles.scrim}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close picker"
        />
        <View style={styles.sheet}>
          <View style={styles.sheetHead}>
            <Text style={styles.sheetTitle} accessibilityRole="header">
              {title}
            </Text>
            <IconButton Icon={X} label="Close" onPress={onClose} />
          </View>

          <View style={[styles.grid, { gap }]}>
            {options.map(o => (
              <Cell
                key={o.id}
                option={o}
                selected={o.id === selectedId}
                width={cellWidth}
                onPress={() => onSelect(o.id)}
              />
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: theme.alpha.scrim,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  sheet: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.panel,
    borderWidth: 1,
    borderColor: theme.colors.secondary,
    padding: 16,
    ...theme.shadow.panel,
  },
  sheetHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sheetTitle: {
    flex: 1,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  cell: {
    width: '100%',
    height: 60,
    borderRadius: theme.radius.tile,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellLabel: { fontSize: 17, lineHeight: 24, fontWeight: '700' },
  checkWrap: { position: 'absolute', top: 4, right: 6 },
});
