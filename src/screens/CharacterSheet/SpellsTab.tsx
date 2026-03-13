import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Colors, FontSize, Spacing } from '../../utils/theme';
import { PF2eCharacter, PF2eItem } from '../../types';
import ProficiencyIndicator from '../../components/ProficiencyIndicator';
import SectionBanner from '../../components/SectionBanner';
import { htmlToPlainText } from '../../utils/htmlUtils';

interface Props {
  character: PF2eCharacter;
}

function formatMod(n: number | undefined): string {
  if (n === undefined || n === null) return '—';
  return n >= 0 ? `+${n}` : `${n}`;
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

  const allSpells = (character.items ?? []).filter((i) => i.type === 'spell');
  const cantrips = allSpells.filter((s) => (s.system?.level?.value ?? 0) === 0 || s.system?.traits?.value?.includes('cantrip'));
  const regularSpells = allSpells.filter((s) => (s.system?.level?.value ?? 0) > 0 && !s.system?.traits?.value?.includes('cantrip'));
  const focusSpells = allSpells.filter((s) => s.system?.traits?.value?.includes('focus'));
  const nonFocusSpells = regularSpells.filter((s) => !s.system?.traits?.value?.includes('focus'));
  const spellGroups = groupSpellsByRank(nonFocusSpells);

  const desc = selected?.system?.description?.value ?? '';
  const plainDesc = htmlToPlainText(desc);
  const traits = selected?.system?.traits?.value ?? [];

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
              <ProficiencyIndicator rank={0} />
              <Text style={styles.breakdownText}>Wis{'\n'}{formatMod(sys?.abilities?.wis?.mod)}</Text>
              <Text style={styles.breakdownText}>Prof{'\n'}+0</Text>
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
                <TouchableOpacity style={styles.castBtn}>
                  <Text style={styles.castBtnText}>Cast</Text>
                </TouchableOpacity>
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
      <Modal visible={selected !== null} animationType="slide" transparent onRequestClose={() => setSelected(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle} numberOfLines={2}>
                {selected?.name ?? ''}
              </Text>
              <TouchableOpacity onPress={() => setSelected(null)} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
            {traits.length > 0 && (
              <View style={styles.traitsRow}>
                {traits.map((t) => (
                  <View key={t} style={styles.traitBadge}>
                    <Text style={styles.traitBadgeText}>{t}</Text>
                  </View>
                ))}
              </View>
            )}
            <ScrollView style={styles.modalBody}>
              {plainDesc ? (
                <Text style={styles.modalDesc}>{plainDesc}</Text>
              ) : (
                <Text style={styles.modalDescMuted}>No description available.</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
    borderTopWidth: 1,
    borderColor: Colors.border,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: FontSize.xl,
    fontWeight: 'bold',
  },
  closeBtn: {
    padding: Spacing.xs,
    marginLeft: Spacing.md,
  },
  closeBtnText: {
    color: Colors.textMuted,
    fontSize: FontSize.lg,
  },
  traitsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
  },
  traitBadge: {
    backgroundColor: Colors.card,
    borderRadius: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  traitBadgeText: {
    color: Colors.secondary,
    fontSize: FontSize.xs,
    textTransform: 'capitalize',
  },
  modalBody: {
    padding: Spacing.lg,
  },
  modalDesc: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    lineHeight: 22,
  },
  modalDescMuted: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    fontStyle: 'italic',
  },
});
