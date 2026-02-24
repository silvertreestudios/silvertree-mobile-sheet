import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, FontSize, Spacing, RANK_COLORS, RANK_LABELS } from '../utils/theme';

interface SkillRowProps {
  label: string;
  modifier: number;
  rank?: number;
  onPress?: () => void;
}

export default function SkillRow({ label, modifier, rank = 0, onPress }: SkillRowProps) {
  const rankColor = RANK_COLORS[rank] ?? Colors.untrained;
  const rankLabel = RANK_LABELS[rank] ?? 'Untrained';
  const modStr = modifier >= 0 ? `+${modifier}` : `${modifier}`;

  const content = (
    <View style={styles.row}>
      <View style={[styles.rankDot, { backgroundColor: rankColor }]} />
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.rankLabel}>{rankLabel}</Text>
      <Text style={[styles.modifier, { color: modifier >= 0 ? Colors.positive : Colors.negative }]}>
        {modStr}
      </Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }
  return content;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  rankDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.sm,
  },
  label: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: FontSize.md,
  },
  rankLabel: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    marginRight: Spacing.md,
    width: 72,
    textAlign: 'right',
  },
  modifier: {
    fontSize: FontSize.md,
    fontWeight: 'bold',
    width: 36,
    textAlign: 'right',
  },
});
