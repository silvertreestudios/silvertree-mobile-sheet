import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Colors, FontSize, Spacing } from '../../utils/theme';
import { PF2eCharacter, PF2eItem } from '../../types';
import { formatMod } from '../../utils/formatters';
import ProficiencyIndicator from '../../components/ProficiencyIndicator';
import SectionBanner from '../../components/SectionBanner';
import ItemDetailModal from '../../components/ItemDetailModal';

interface Props {
  character: PF2eCharacter;
}

interface SpellsByRank {
  rank: number;
  spells: PF2eItem[];
}

function groupSpellsByRank(spells: PF2eItem[]): SpellsByRank[] {
  const map = new Map<number, PF2eItem[]>();
  for (const spell of spells) {
    const rank = spell.system?.level?.value ?? 0;
    if (!map.has(rank)) map.set(rank, []);
    map.get(rank)!.push(spell);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a - b)
    .map(([rank, spells]) => ({ rank, spells }));
}

export default function SpellsTab({ character }: Props) {
  const [selected, setSelected] = useState<PF2eItem | null>(null);
  const sys = character.system;
  const focus = sys?.resources?.focus;
  const classDC = sys?.attributes?.classDC;
  const keyAbility = sys?.details?.keyability?.value ?? 'wis';
  const keyAbilityLabel = keyAbility.charAt(0).toUpperCase() + keyAbility.slice(1);
  const keyAbilityMod = sys?.abilities?.[keyAbility as keyof NonNullable<typeof sys.abilities>]?.mod;

  const allSpells = (character.items ?? []).filter((i) => i.type === 'spell');
  const cantrips = allSpells.filter((s) => ((s.system?.level?.value ?? 0) === 0 || s.system?.traits?.value?.includes('cantrip')) && !s.system?.traits?.value?.includes('focus'));
  const regularSpells = allSpells.filter((s) => (s.system?.level?.value ?? 0) > 0 && !s.system?.traits?.value?.includes('cantrip'));
  const focusSpells = allSpells.filter((s) => s.system?.traits?.value?.includes('focus'));
  const nonFocusSpells = regularSpells.filter((s) => !s.system?.traits?.value?.includes('focus'));
  const spellGroups = groupSpellsByRank(nonFocusSpells);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Restore All button */}
      <TouchableOpacity style={styles.restoreBtn}>
        <Text style={styles.restoreBtnText}>Restore All Spell Slots</Text>
      </TouchableOpacity>

      {/* Focus Spells */}
      {(focusSpells.length > 0 || (focus && focus.max && focus.max > 0)) && (
        <>
          <SectionBanner title="Focus Spells" />
          {focus && (
            <View style={styles.focusInfo}>
              <Text style={styles.focusIcon}>🔥</Text>
              {focusSpells.map((spell) => (
                <TouchableOpacity
                  key={spell._id}
                  style={styles.focusSpellRow}
                  onPress={() => setSelected(spell)}
                >
                  <View style={styles.spellIconContainer}>
                    <Text style={styles.spellIcon}>❯❯❯</Text>
                  </View>
                  <Text style={styles.focusSpellName}>{spell.name}</Text>
                  <Text style={styles.focusLabel}>Focus 1</Text>
                  <View style={styles.focusCountBadge}>
                    <Text style={styles.focusCountText}>{focus.max ?? 0}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </>
      )}

      {/* Spellcasting section */}
      {classDC !== undefined && (
        <>
          <SectionBanner title={`${sys?.details?.class?.value ?? 'Class'}`} />
          <View style={styles.dcSection}>
            <View style={styles.dcRow}>
              <Text style={styles.dcText}>DC {classDC.value ?? '—'}</Text>
              <ProficiencyIndicator rank={classDC.rank ?? 0} />
              <Text style={styles.breakdownText}>{keyAbilityLabel}{'\n'}{formatMod(keyAbilityMod)}</Text>
              <Text style={styles.breakdownText}>Prof{'\n'}{formatMod(classDC.rank ? classDC.rank * 2 + (sys?.details?.level?.value ?? 1) : 0)}</Text>
              <Text style={styles.breakdownText}>Item{'\n'}+0</Text>
            </View>
            <Text style={styles.saText}>SA {formatMod(classDC.value ? classDC.value - 10 : undefined)}</Text>
          </View>
        </>
      )}

      {/* Cantrips */}
      {cantrips.length > 0 && (
        <View style={styles.rankSection}>
          <Text style={styles.rankTitle}>
            Cantrips (Heightened Rank {Math.ceil((sys?.details?.level?.value ?? 1) / 2)})
          </Text>
          <View style={styles.spellList}>
            {cantrips.map((spell) => (
              <TouchableOpacity
                key={spell._id}
                style={styles.spellRow}
                onPress={() => setSelected(spell)}
              >
                <View style={styles.spellIconContainer}>
                  <Text style={styles.spellIcon}>❯❯❯</Text>
                </View>
                <Text style={styles.spellName}>{spell.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Spell ranks */}
      {spellGroups.map(({ rank, spells }) => (
        <View key={rank} style={styles.rankSection}>
          <Text style={styles.rankTitle}>Spell Rank {rank}</Text>
          <View style={styles.spellList}>
            {spells.map((spell) => (
              <TouchableOpacity
                key={spell._id}
                style={styles.spellRow}
                onPress={() => setSelected(spell)}
              >
                <View style={styles.castBtn}>
                  <Text style={styles.castBtnText}>Cast</Text>
                </View>
                <View style={styles.spellIconContainer}>
                  <Text style={styles.spellIcon}>❯❯❯</Text>
                </View>
                <Text style={styles.spellName}>{spell.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      {allSpells.length === 0 && (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No spells found.</Text>
        </View>
      )}

      {/* Spell detail modal */}
      <ItemDetailModal
        item={selected}
        visible={selected !== null}
        onClose={() => setSelected(null)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: Spacing.xxl },
  restoreBtn: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
    backgroundColor: Colors.card,
    borderRadius: 8,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  restoreBtnText: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
  },
  focusInfo: {
    padding: Spacing.md,
  },
  focusIcon: {
    fontSize: FontSize.xxl,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  focusSpellRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  focusSpellName: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  focusLabel: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    marginRight: Spacing.sm,
  },
  focusCountBadge: {
    backgroundColor: Colors.sectionBanner,
    borderRadius: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  focusCountText: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: 'bold',
  },
  dcSection: {
    padding: Spacing.md,
    backgroundColor: Colors.card,
    marginHorizontal: 0,
  },
  dcRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dcText: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: 'bold',
    flex: 1,
  },
  saText: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    marginTop: Spacing.sm,
  },
  breakdownText: {
    color: Colors.textMuted,
    fontSize: 10,
    textAlign: 'center',
    marginLeft: Spacing.xs,
    minWidth: 30,
  },
  rankSection: {
    marginTop: Spacing.md,
  },
  rankTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: '600',
    textAlign: 'center',
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
  },
  spellList: {
    backgroundColor: Colors.card,
  },
  spellRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  castBtn: {
    backgroundColor: Colors.surface,
    borderRadius: 4,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    marginRight: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  castBtnText: {
    color: Colors.textPrimary,
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  spellIconContainer: {
    marginRight: Spacing.sm,
  },
  spellIcon: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    letterSpacing: -2,
  },
  spellName: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: FontSize.md,
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
