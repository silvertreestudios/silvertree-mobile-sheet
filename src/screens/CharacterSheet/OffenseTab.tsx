import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Colors, FontSize, Spacing } from '../../utils/theme';
import { PF2eCharacter, PF2eItem } from '../../types';
import { formatMod } from '../../utils/formatters';
import ProficiencyIndicator from '../../components/ProficiencyIndicator';
import foundryApi from '../../api/foundryApi';
import { useApp } from '../../contexts/AppContext';

interface Props {
  character: PF2eCharacter;
}

export default function OffenseTab({ character }: Props) {
  const { config } = useApp();
  const sys = character.system;
  const attrs = sys?.attributes;
  const perception = attrs?.perception;
  const weapons = (character.items ?? []).filter((i) => i.type === 'weapon');

  async function handleRoll(formula: string, label: string) {
    if (!config.clientId) return;
    try {
      const result = await foundryApi.roll(formula, label);
      let critStr = '';
      if (result.isCritical) critStr = ' 🎯 Critical!';
      else if (result.isFumble) critStr = ' 💀 Fumble!';
      Alert.alert(`${label}`, `Roll: ${result.total}${critStr}`);
    } catch (e: unknown) {
      Alert.alert('Roll Error', e instanceof Error ? e.message : 'Failed to roll');
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Perception */}
      {perception && (
        <View style={styles.perceptionSection}>
          <TouchableOpacity
            style={styles.perceptionRow}
            onPress={() => handleRoll(
              `1d20${(perception.totalModifier ?? 0) >= 0 ? '+' : ''}${perception.totalModifier ?? 0}`,
              'Perception'
            )}
            activeOpacity={0.7}
          >
            <Text style={styles.d20}>⬡</Text>
            <View style={styles.perceptionInfo}>
              <Text style={styles.perceptionName}>
                Perception {formatMod(perception.totalModifier)}
              </Text>
              <Text style={styles.initiativeText}>
                Initiative Bonus +0
              </Text>
            </View>
            <ProficiencyIndicator rank={perception.rank ?? 0} />
            <Text style={styles.breakdownText}>Wis{'\n'}{formatMod(sys?.abilities?.wis?.mod)}</Text>
            <Text style={styles.breakdownText}>Prof{'\n'}{formatMod((perception.totalModifier ?? 0) - (sys?.abilities?.wis?.mod ?? 0))}</Text>
            <Text style={styles.breakdownText}>Item{'\n'}+0</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Action buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionBtn}>
          <Text style={styles.actionBtnText}>Add Weapon</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Text style={styles.actionBtnText}>View Actions</Text>
        </TouchableOpacity>
      </View>

      {/* Weapons */}
      {weapons.map((weapon) => (
        <WeaponCard key={weapon._id} weapon={weapon} character={character} onRoll={handleRoll} />
      ))}

      {weapons.length === 0 && (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No weapons equipped.</Text>
        </View>
      )}
    </ScrollView>
  );
}

function WeaponCard({ weapon, character, onRoll }: { weapon: PF2eItem; character: PF2eCharacter; onRoll: (formula: string, label: string) => void }) {
  const sys = character.system;
  const damage = weapon.system?.damage;
  const traits = weapon.system?.traits?.value ?? [];

  // Get first damage entry
  const damageEntries = damage ? Object.values(damage) : [];
  const primaryDamage = damageEntries[0];
  const damageStr = primaryDamage?.damage ?? '—';
  const damageType = primaryDamage?.damageType ?? '';

  // Determine attack ability (finesse/ranged = dex, otherwise str)
  const isFinesse = traits.includes('finesse');
  const slug = weapon.system?.slug ?? '';
  const isRanged = traits.includes('ranged') || slug.includes('bow') || slug.includes('crossbow');
  const attackAbility = isFinesse || isRanged ? 'Dex' : 'Str';
  const abilityKey = attackAbility.toLowerCase() as 'str' | 'dex';
  const attackAbilityMod = sys?.abilities?.[abilityKey]?.mod ?? 0;

  return (
    <View style={styles.weaponCard}>
      <Text style={styles.weaponName}>{weapon.name}</Text>
      {traits.length > 0 && (
        <View style={styles.traitsRow}>
          {traits.slice(0, 3).map((t) => (
            <View key={t} style={styles.traitBadge}>
              <Text style={styles.traitText}>{t}</Text>
            </View>
          ))}
        </View>
      )}
      <View style={styles.weaponStatsRow}>
        <Text style={styles.d20}>⬡</Text>
        <Text style={styles.weaponMod}>{formatMod(attackAbilityMod)}</Text>
        <ProficiencyIndicator rank={0} />
        <Text style={styles.breakdownText}>{attackAbility}{'\n'}{formatMod(attackAbilityMod)}</Text>
        <Text style={styles.breakdownText}>Prof{'\n'}+0</Text>
        <Text style={styles.breakdownText}>Item{'\n'}+0</Text>
      </View>
      <View style={styles.damageRow}>
        <Text style={styles.d20}>⬡</Text>
        <Text style={styles.damageText}>
          {damageStr}
          {damageType ? <Text style={styles.damageType}>{damageType.charAt(0).toUpperCase()}</Text> : ''}
        </Text>
      </View>
      <View style={styles.weaponActions}>
        <TouchableOpacity
          style={styles.weaponActionBtn}
          onPress={() => onRoll(`1d20+${attackAbilityMod}`, `${weapon.name} Attack`)}
        >
          <Text style={styles.weaponActionText}>⬡ Roll</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.weaponActionBtn}>
          <Text style={styles.weaponActionText}>Options</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.weaponActionBtn}>
          <Text style={styles.weaponActionText}>Runes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.weaponActionBtn}>
          <Text style={styles.weaponActionText}>Info</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.weaponActionBtn}>
          <Text style={styles.weaponActionText}>Stow</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: Spacing.xxl },
  perceptionSection: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    backgroundColor: Colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  perceptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  d20: {
    color: Colors.textMuted,
    fontSize: FontSize.xl,
    marginRight: Spacing.sm,
    width: 24,
    textAlign: 'center',
  },
  perceptionInfo: {
    flex: 1,
  },
  perceptionName: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: 'bold',
  },
  initiativeText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  breakdownText: {
    color: Colors.textMuted,
    fontSize: 10,
    textAlign: 'center',
    marginLeft: Spacing.xs,
    minWidth: 30,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    gap: Spacing.md,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 8,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionBtnText: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
  },
  weaponCard: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  weaponName: {
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: 'bold',
    marginBottom: Spacing.xs,
  },
  traitsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  traitBadge: {
    backgroundColor: Colors.surface,
    borderRadius: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  traitText: {
    color: Colors.secondary,
    fontSize: FontSize.xs,
    textTransform: 'capitalize',
    fontWeight: '600',
  },
  weaponStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  weaponMod: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: 'bold',
    flex: 1,
  },
  damageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  damageText: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
  },
  damageType: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
  },
  weaponActions: {
    flexDirection: 'row',
    marginTop: Spacing.sm,
    gap: 2,
  },
  weaponActionBtn: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 4,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  weaponActionText: {
    color: Colors.textPrimary,
    fontSize: FontSize.xs,
    fontWeight: '500',
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
  },
});
