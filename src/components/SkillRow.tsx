import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, FontSize, Spacing } from '../utils/theme';
import ProficiencyIndicator from './ProficiencyIndicator';

interface SkillRowProps {
  label: string;
  modifier: number;
  rank?: number;
  abilityMod?: number;
  abilityLabel?: string;
  profBonus?: number;
  itemBonus?: number;
  armorPenalty?: number;
  onPress?: () => void;
}

export default function SkillRow({
  label,
  modifier,
  rank = 0,
  abilityMod,
  abilityLabel,
  profBonus,
  itemBonus,
  armorPenalty,
  onPress,
}: SkillRowProps) {
  const modStr = modifier >= 0 ? `+${modifier}` : `${modifier}`;

  const content = (
    <View style={styles.row}>
      <Text style={styles.d20}>⬡</Text>
      <View style={styles.nameCol}>
        <Text style={styles.label}>{label} {modStr}</Text>
      </View>
      {armorPenalty !== undefined && armorPenalty !== 0 && (
        <Text style={styles.armorLabel}>Armor{'\n'}{armorPenalty}</Text>
      )}
      <ProficiencyIndicator rank={rank} />
      {abilityLabel !== undefined && (
        <Text style={styles.breakdownText}>
          {abilityLabel}{'\n'}
          {abilityMod !== undefined ? (abilityMod >= 0 ? `+${abilityMod}` : `${abilityMod}`) : ''}
        </Text>
      )}
      {profBonus !== undefined && (
        <Text style={styles.breakdownText}>
          Prof{'\n'}+{profBonus}
        </Text>
      )}
      <Text style={styles.breakdownText}>
        Item{'\n'}+{itemBonus ?? 0}
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
    paddingHorizontal: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  d20: {
    color: Colors.textMuted,
    fontSize: FontSize.xl,
    marginRight: Spacing.sm,
    width: 24,
    textAlign: 'center',
  },
  nameCol: {
    flex: 1,
  },
  label: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: 'bold',
  },
  armorLabel: {
    color: Colors.textMuted,
    fontSize: 9,
    textAlign: 'center',
    marginRight: Spacing.xs,
  },
  breakdownText: {
    color: Colors.textMuted,
    fontSize: 10,
    textAlign: 'center',
    marginLeft: Spacing.xs,
    minWidth: 30,
  },
});
