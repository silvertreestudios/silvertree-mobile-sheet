import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Colors, FontSize, Spacing, SKILL_LABELS, ABILITY_LABELS } from '../../utils/theme';
import { PF2eCharacter } from '../../types';
import SkillRow from '../../components/SkillRow';
import foundryApi from '../../api/foundryApi';
import { useApp } from '../../contexts/AppContext';

interface Props {
  character: PF2eCharacter;
}

// Map skills to their key ability
const SKILL_ABILITIES: Record<string, string> = {
  acrobatics: 'dex',
  arcana: 'int',
  athletics: 'str',
  crafting: 'int',
  deception: 'cha',
  diplomacy: 'cha',
  intimidation: 'cha',
  medicine: 'wis',
  nature: 'wis',
  occultism: 'int',
  performance: 'cha',
  religion: 'wis',
  society: 'int',
  stealth: 'dex',
  survival: 'wis',
  thievery: 'dex',
};

// Skills that get armor penalty
const ARMOR_PENALTY_SKILLS = ['acrobatics', 'athletics', 'stealth', 'thievery'];

export default function SkillsTab({ character }: Props) {
  const { config } = useApp();
  const skills = character.system?.skills ?? {};
  const abilities = character.system?.abilities ?? {};

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
      <View style={styles.skillsList}>
        {skillKeys.map((key) => {
          const skill = skills[key];
          if (!skill) return null;
          const label = SKILL_LABELS[key] ?? key;
          const mod = skill.totalModifier ?? skill.mod ?? skill.value ?? 0;
          const rank = skill.rank ?? 0;
          const abilityKey = SKILL_ABILITIES[key] ?? 'str';
          const abilityData = abilities[abilityKey as keyof typeof abilities];
          const abilityMod = abilityData?.mod ?? 0;
          const abilityLabel = ABILITY_LABELS[abilityKey] ?? abilityKey.toUpperCase();
          const profBonus = rank > 0 ? rank * 2 + (character.system?.details?.level?.value ?? 1) : 0;
          const hasArmorPenalty = ARMOR_PENALTY_SKILLS.includes(key);

          return (
            <SkillRow
              key={key}
              label={label}
              modifier={mod}
              rank={rank}
              abilityMod={abilityMod}
              abilityLabel={abilityLabel.substring(0, 3)}
              profBonus={profBonus}
              itemBonus={0}
              armorPenalty={hasArmorPenalty ? 0 : undefined}
              onPress={() => handleRollSkill(key, label, mod)}
            />
          );
        })}
        {skillKeys.filter((k) => skills[k]).length === 0 && (
          <Text style={styles.empty}>No skill data available.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  skillsList: {
    backgroundColor: Colors.background,
  },
  empty: {
    color: Colors.textMuted,
    textAlign: 'center',
    padding: Spacing.lg,
    fontSize: FontSize.sm,
  },
});
