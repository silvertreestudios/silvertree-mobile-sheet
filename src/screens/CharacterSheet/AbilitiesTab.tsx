import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors, FontSize, Spacing, ABILITY_LABELS } from '../../utils/theme';
import { PF2eCharacter } from '../../types';
import { computeCharacterStats, formatMod } from '../../utils/characterUtils';

interface Props {
  character: PF2eCharacter;
}

export default function AbilitiesTab({ character }: Props) {
  const abilities = character.system?.abilities;
  const abilityKeys = ['str', 'dex', 'con', 'int', 'wis', 'cha'] as const;
  const hasAbilityData = abilities !== null && abilities !== undefined && Object.keys(abilities).length > 0;
  const computed = computeCharacterStats(character);

  const displayData = abilityKeys.map((key) => {
    if (hasAbilityData) {
      const ability = (abilities as Record<string, { value?: number; mod?: number }>)[key];
      const score = ability?.value ?? 10;
      const mod = ability?.mod ?? Math.floor((score - 10) / 2);
      return { key, primary: String(score), secondary: formatMod(mod), color: mod >= 0 ? Colors.positive : Colors.negative };
    }
    if (computed) {
      const mod = computed.abilityMods[key];
      return { key, primary: formatMod(mod), secondary: 'MOD', color: Colors.textMuted };
    }
    return { key, primary: '—', secondary: '—', color: Colors.textMuted };
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ability Scores</Text>
        <View style={styles.abilityGrid}>
          {displayData.map(({ key, primary, secondary, color }) => (
            <View key={key} style={styles.abilityCard}>
              <Text style={styles.abilityLabel}>{ABILITY_LABELS[key]}</Text>
              <Text style={styles.abilityScore}>{primary}</Text>
              <Text style={[styles.abilityMod, { color }]}>{secondary}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md },
  section: { marginBottom: Spacing.lg },
  sectionTitle: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: Spacing.md,
  },
  abilityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  abilityCard: {
    width: '30%',
    backgroundColor: Colors.card,
    borderRadius: 10,
    padding: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  abilityLabel: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  abilityScore: {
    color: Colors.textPrimary,
    fontSize: FontSize.xxxl,
    fontWeight: 'bold',
    lineHeight: FontSize.xxxl + 8,
  },
  abilityMod: {
    fontSize: FontSize.lg,
    fontWeight: '600',
  },
});
