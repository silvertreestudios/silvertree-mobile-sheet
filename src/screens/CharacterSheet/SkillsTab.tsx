import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Colors, FontSize, Spacing, SKILL_LABELS } from '../../utils/theme';
import { PF2eCharacter } from '../../types';
import SkillRow from '../../components/SkillRow';
import foundryApi from '../../api/foundryApi';
import { useApp } from '../../contexts/AppContext';

interface Props {
  character: PF2eCharacter;
}

export default function SkillsTab({ character }: Props) {
  const { config } = useApp();
  const skills = character.system?.skills ?? {};
  const perception = character.system?.attributes?.perception;

  const skillKeys = Object.keys(SKILL_LABELS).sort();

  async function handleRollSkill(key: string, label: string, mod: number) {
    if (!config.clientId) return;
    try {
      const result = await foundryApi.roll(`1d20${mod >= 0 ? '+' : ''}${mod}`, label);
      let critStr = '';
      if (result.isCritical) {
        critStr = ' 🎯 Critical!';
      } else if (result.isFumble) {
        critStr = ' 💀 Fumble!';
      }
      Alert.alert(`${label} Check`, `Roll: ${result.total}${critStr}`);
    } catch (e: unknown) {
      Alert.alert('Roll Error', e instanceof Error ? e.message : 'Failed to roll');
    }
  }

  return (
    <ScrollView style={styles.container}>
      {/* Perception at the top */}
      {perception !== undefined && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Perception</Text>
          <View style={styles.card}>
            <SkillRow
              label="Perception"
              modifier={perception.totalModifier ?? 0}
              rank={0}
              onPress={() =>
                handleRollSkill(
                  'perception',
                  'Perception',
                  perception.totalModifier ?? 0
                )
              }
            />
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Skills</Text>
        <View style={styles.card}>
          {skillKeys.map((key) => {
            const skill = skills[key];
            if (!skill) return null;
            const label = SKILL_LABELS[key] ?? key;
            const mod = skill.totalModifier ?? skill.mod ?? skill.value ?? 0;
            const rank = skill.rank ?? 0;
            return (
              <SkillRow
                key={key}
                label={label}
                modifier={mod}
                rank={rank}
                onPress={() => handleRollSkill(key, label, mod)}
              />
            );
          })}
          {skillKeys.filter((k) => skills[k]).length === 0 && (
            <Text style={styles.empty}>No skill data available.</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  section: {
    padding: Spacing.md,
    paddingBottom: 0,
  },
  sectionTitle: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  empty: {
    color: Colors.textMuted,
    textAlign: 'center',
    padding: Spacing.lg,
    fontSize: FontSize.sm,
  },
});
