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
import { PF2eCharacter } from '../../types';
import { formatMod } from '../../utils/formatters';
import ProficiencyIndicator from '../../components/ProficiencyIndicator';
import foundryApi from '../../api/foundryApi';
import { useApp } from '../../contexts/AppContext';

interface Props {
  character: PF2eCharacter;
  onRefresh: () => void;
}

function getHpColor(current: number, max: number): string {
  if (max === 0) return Colors.textPrimary;
  const pct = current / max;
  if (pct > 0.5) return Colors.hpHigh;
  if (pct > 0.25) return Colors.hpMed;
  return Colors.hpLow;
}

export default function DefenseTab({ character, onRefresh }: Props) {
  const { config } = useApp();
  const sys = character.system;
  const attrs = sys?.attributes;
  const saves = sys?.saves;
  const hp = attrs?.hp;
  const shield = attrs?.shield;
  const dying = attrs?.dying;
  const wounded = attrs?.wounded;
  const ac = attrs?.ac;

  const hpCurrent = hp?.value ?? 0;
  const hpMax = hp?.max ?? 1;

  // Find armor item
  const armorItem = (character.items ?? []).find(
    (i) => i.type === 'armor' && i.system?.equipped?.carryType === 'worn'
  );

  async function adjustHp(delta: number) {
    if (!config.actorUuid || !config.clientId) return;
    try {
      if (delta > 0) {
        await foundryApi.increaseAttribute(
          config.actorUuid,
          'system.attributes.hp.value',
          Math.abs(delta)
        );
      } else {
        await foundryApi.decreaseAttribute(
          config.actorUuid,
          'system.attributes.hp.value',
          Math.abs(delta)
        );
      }
      onRefresh();
    } catch (e: unknown) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to update HP');
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* AC + HP header */}
      <View style={styles.topRow}>
        <View style={styles.acBox}>
          <Text style={styles.acLabel}>AC</Text>
          <Text style={styles.acValue}>{ac?.value ?? '—'}</Text>
        </View>
        <View style={styles.hpBox}>
          <Text style={styles.hpText}>HP {hpCurrent}/{hpMax}</Text>
          <View style={styles.hpBarBackground}>
            <View
              style={[
                styles.hpBarFill,
                {
                  width: `${Math.min(100, Math.max(0, (hpCurrent / hpMax) * 100))}%`,
                  backgroundColor: getHpColor(hpCurrent, hpMax),
                },
              ]}
            />
          </View>
        </View>
      </View>

      {/* HP adjustment buttons */}
      <View style={styles.hpButtons}>
        <TouchableOpacity style={styles.hpBtn} onPress={() => adjustHp(-5)}>
          <Text style={styles.hpBtnText}>−5</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.hpBtn} onPress={() => adjustHp(-1)}>
          <Text style={styles.hpBtnText}>−1</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.hpBtn} onPress={() => adjustHp(1)}>
          <Text style={styles.hpBtnText}>+1</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.hpBtn} onPress={() => adjustHp(5)}>
          <Text style={styles.hpBtnText}>+5</Text>
        </TouchableOpacity>
      </View>

      {/* Saving Throws */}
      {saves && (
        <View style={styles.savesSection}>
          {[
            { key: 'fortitude', label: 'Fortitude', save: saves.fortitude, ability: 'Con', abilityMod: sys?.abilities?.con?.mod, rank: saves.fortitude?.rank },
            { key: 'reflex', label: 'Reflex', save: saves.reflex, ability: 'Dex', abilityMod: sys?.abilities?.dex?.mod, rank: saves.reflex?.rank },
            { key: 'will', label: 'Will', save: saves.will, ability: 'Wis', abilityMod: sys?.abilities?.wis?.mod, rank: saves.will?.rank },
          ].map(({ key, label, save, ability, abilityMod, rank }) => {
            const mod = save?.totalModifier ?? save?.value ?? 0;
            return (
              <View key={key} style={styles.saveRow}>
                <Text style={styles.d20}>⬡</Text>
                <Text style={styles.saveName}>{label} {formatMod(mod)}</Text>
                <ProficiencyIndicator rank={rank ?? 0} />
                <Text style={styles.breakdownText}>{ability}{'\n'}{formatMod(abilityMod)}</Text>
                <Text style={styles.breakdownText}>Prof{'\n'}{formatMod(mod - (abilityMod ?? 0))}</Text>
                <Text style={styles.breakdownText}>Item{'\n'}+0</Text>
              </View>
            );
          })}
        </View>
      )}

      {/* Conditions */}
      {((dying?.value ?? 0) > 0 || (wounded?.value ?? 0) > 0) && (
        <View style={styles.conditionsSection}>
          {(dying?.value ?? 0) > 0 && (
            <View style={[styles.conditionBadge, { backgroundColor: Colors.negative }]}>
              <Text style={styles.conditionText}>
                Dying {dying?.value}/{dying?.max ?? 4}
              </Text>
            </View>
          )}
          {(wounded?.value ?? 0) > 0 && (
            <View style={[styles.conditionBadge, { backgroundColor: Colors.warning }]}>
              <Text style={styles.conditionText}>Wounded {wounded?.value}</Text>
            </View>
          )}
        </View>
      )}

      {/* Condition buttons */}
      <View style={styles.conditionButtons}>
        <TouchableOpacity style={styles.conditionBtn}>
          <Text style={styles.conditionBtnText}>Add Condition</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.conditionBtn}>
          <Text style={styles.conditionBtnText}>Add Custom Buff</Text>
        </TouchableOpacity>
      </View>

      {/* Armor section */}
      {armorItem && (
        <View style={styles.armorSection}>
          <Text style={styles.armorName}>{armorItem.name}</Text>
          <View style={styles.armorRow}>
            <Text style={styles.armorAcText}>AC {ac?.value ?? '—'}</Text>
            <ProficiencyIndicator rank={0} />
            <Text style={styles.breakdownText}>Dex{'\n'}{formatMod(sys?.abilities?.dex?.mod)}</Text>
            <Text style={styles.breakdownText}>Prof{'\n'}+0</Text>
            <Text style={styles.breakdownText}>Item{'\n'}+0</Text>
          </View>
          {armorItem.system?.traits?.value && armorItem.system.traits.value.length > 0 && (
            <View style={styles.traitsRow}>
              {armorItem.system.traits.value.map((t) => (
                <View key={t} style={styles.traitBadge}>
                  <Text style={styles.traitText}>{t}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Shield section */}
      <View style={styles.shieldSection}>
        <Text style={styles.armorName}>
          {shield?.hp ? 'Shield' : 'No Shield'}
        </Text>
        {shield?.hp && (
          <View style={styles.shieldStats}>
            <Text style={styles.shieldText}>
              Hardness: {shield.hardness ?? 0} | HP: {shield.hp.value ?? 0}/{shield.hp.max ?? 0}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: Spacing.xxl },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  acBox: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.border,
    padding: Spacing.md,
    alignItems: 'center',
    minWidth: 70,
  },
  acLabel: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  acValue: {
    color: Colors.textPrimary,
    fontSize: FontSize.xxxl,
    fontWeight: 'bold',
  },
  hpBox: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
  },
  hpText: {
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: 'bold',
    marginBottom: Spacing.xs,
  },
  hpBarBackground: {
    height: 6,
    backgroundColor: Colors.surface,
    borderRadius: 3,
    overflow: 'hidden',
  },
  hpBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  hpButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  hpBtn: {
    backgroundColor: Colors.card,
    borderRadius: 6,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  hpBtnText: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  savesSection: {
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  saveRow: {
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
  saveName: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: 'bold',
  },
  breakdownText: {
    color: Colors.textMuted,
    fontSize: 10,
    textAlign: 'center',
    marginLeft: Spacing.xs,
    minWidth: 30,
  },
  conditionsSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    gap: Spacing.xs,
  },
  conditionBadge: {
    borderRadius: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  conditionText: {
    color: Colors.textPrimary,
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  conditionButtons: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    gap: Spacing.md,
  },
  conditionBtn: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 8,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  conditionBtnText: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
  },
  armorSection: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  armorName: {
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: 'bold',
    marginBottom: Spacing.sm,
  },
  armorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  armorAcText: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: '600',
    flex: 1,
  },
  traitsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: Spacing.sm,
    gap: Spacing.xs,
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
  shieldSection: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  shieldStats: {
    marginTop: Spacing.xs,
  },
  shieldText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
  },
});
