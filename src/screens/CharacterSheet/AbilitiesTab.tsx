import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors, FontSize, Spacing, ABILITY_LABELS } from '../../utils/theme';
import { PF2eCharacter } from '../../types';
import StatBox from '../../components/StatBox';

interface Props {
  character: PF2eCharacter;
}

function abilityMod(score: number): number {
  return Math.floor((score - 10) / 2);
}

function formatMod(n: number): string {
  return n >= 0 ? `+${n}` : `${n}`;
}

export default function AbilitiesTab({ character }: Props) {
  const abilities = character.system?.abilities ?? {};
  const abilityKeys = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ability Scores</Text>
        <View style={styles.abilityGrid}>
          {abilityKeys.map((key) => {
            const ability = abilities[key as keyof typeof abilities];
            const score = ability?.value ?? 10;
            const mod = ability?.mod ?? abilityMod(score);
            return (
              <View key={key} style={styles.abilityCard}>
                <Text style={styles.abilityLabel}>{ABILITY_LABELS[key]}</Text>
                <Text style={styles.abilityScore}>{score}</Text>
                <Text
                  style={[
                    styles.abilityMod,
                    { color: mod >= 0 ? Colors.positive : Colors.negative },
                  ]}
                >
                  {formatMod(mod)}
                </Text>
              </View>
            );
          })}
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
