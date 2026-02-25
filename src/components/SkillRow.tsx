import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, FontSize, Spacing, RANK_COLORS } from '../utils/theme';

interface SkillRowProps {
  label: string;
  modifier: number;
  rank?: number;
  onPress?: () => void;
}

const PROF_LABELS = ['T', 'E', 'M', 'L'];

function ProficiencyCircles({ rank }: { rank: number }) {
  return (
    <View style={profStyles.row}>
      {PROF_LABELS.map((label, i) => {
        const circleRank = i + 1; // T=1, E=2, M=3, L=4
        const isActive = circleRank === rank;
        const color = isActive ? RANK_COLORS[rank] ?? Colors.textMuted : Colors.border;
        return (
          <View key={label} style={profStyles.circleWrapper}>
            <Text style={profStyles.circleLabel}>{label}</Text>
            <View style={[profStyles.circle, { borderColor: color }]}>
              {isActive && (
                <Text style={[profStyles.circleX, { color }]}>✕</Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

export default function SkillRow({ label, modifier, rank = 0, onPress }: SkillRowProps) {
  const modStr = modifier >= 0 ? `+${modifier}` : `${modifier}`;

  const content = (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <ProficiencyCircles rank={rank} />
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

const profStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginHorizontal: Spacing.sm,
  },
  circleWrapper: {
    alignItems: 'center',
    marginHorizontal: 2,
  },
  circleLabel: {
    color: Colors.textMuted,
    fontSize: 8,
    fontWeight: '600',
    marginBottom: 1,
  },
  circle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleX: {
    fontSize: 8,
    fontWeight: 'bold',
    lineHeight: 10,
  },
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  label: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: '500',
  },
  modifier: {
    fontSize: FontSize.md,
    fontWeight: 'bold',
    width: 40,
    textAlign: 'right',
  },
});
