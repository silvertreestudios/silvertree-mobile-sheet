import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Colors, FontSize, Spacing } from '../../utils/theme';
import { PF2eCharacter, PF2eItem } from '../../types';
import ItemRow from '../../components/ItemRow';
import { htmlToPlainText } from '../../utils/htmlUtils';

interface Props {
  character: PF2eCharacter;
}

interface InventorySection {
  title: string;
  data: PF2eItem[];
}

const INVENTORY_TYPES = ['weapon', 'armor', 'equipment', 'consumable', 'treasure', 'backpack'];

function categorize(items: PF2eItem[]): InventorySection[] {
  const categories: Record<string, PF2eItem[]> = {
    Weapons: [],
    Armor: [],
    Equipment: [],
    Consumables: [],
    Treasure: [],
    Containers: [],
    Other: [],
  };

  for (const item of items) {
    switch (item.type) {
      case 'weapon':
        categories.Weapons.push(item);
        break;
      case 'armor':
        categories.Armor.push(item);
        break;
      case 'equipment':
        categories.Equipment.push(item);
        break;
      case 'consumable':
        categories.Consumables.push(item);
        break;
      case 'treasure':
        categories.Treasure.push(item);
        break;
      case 'backpack':
        categories.Containers.push(item);
        break;
      default:
        if (INVENTORY_TYPES.includes(item.type)) {
          categories.Equipment.push(item);
        }
    }
  }

  return Object.entries(categories)
    .filter(([, items]) => items.length > 0)
    .map(([title, data]) => ({ title, data }));
}

function totalBulk(items: PF2eItem[]): string {
  let bulk = 0;
  for (const item of items) {
    const b = item.system?.bulk?.value ?? 0;
    const q = item.system?.quantity ?? 1;
    bulk += b * q;
  }
  if (bulk === 0) return '0';
  return bulk.toFixed(1);
}

export default function InventoryTab({ character }: Props) {
  const [selected, setSelected] = useState<PF2eItem | null>(null);
  const inventoryItems = (character.items ?? []).filter((i) =>
    [...INVENTORY_TYPES].includes(i.type)
  );
  const sections = categorize(inventoryItems);

  const desc = selected?.system?.description?.value ?? '';
  const plainDesc = htmlToPlainText(desc);
  const traits = selected?.system?.traits?.value ?? [];

  return (
    <View style={styles.container}>
      {/* Bulk summary */}
      <View style={styles.bulkBar}>
        <Text style={styles.bulkText}>
          Total Bulk: {totalBulk(inventoryItems)}
        </Text>
        <Text style={styles.bulkText}>{inventoryItems.length} items</Text>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <ItemRow item={item} onPress={(i) => setSelected(i)} />
        )}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {section.title} ({section.data.length})
            </Text>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No items in inventory.</Text>
          </View>
        }
        stickySectionHeadersEnabled
      />

      {/* Item detail modal */}
      <Modal
        visible={selected !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setSelected(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle} numberOfLines={2}>
                {selected?.name ?? ''}
              </Text>
              <TouchableOpacity
                onPress={() => setSelected(null)}
                style={styles.closeBtn}
              >
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
            {traits.length > 0 && (
              <View style={styles.traitsRow}>
                {traits.map((t) => (
                  <View key={t} style={styles.traitBadge}>
                    <Text style={styles.traitText}>{t}</Text>
                  </View>
                ))}
              </View>
            )}
            <ScrollView style={styles.modalBody}>
              {/* Item stats */}
              {selected && (
                <View style={styles.statsRow}>
                  {selected.system?.quantity !== undefined && (
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>QTY</Text>
                      <Text style={styles.statValue}>{selected.system.quantity}</Text>
                    </View>
                  )}
                  {selected.system?.bulk?.value !== undefined && (
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>BULK</Text>
                      <Text style={styles.statValue}>
                        {selected.system.bulk.value === 0 ? 'L' : selected.system.bulk.value}
                      </Text>
                    </View>
                  )}
                  {selected.system?.level?.value !== undefined && (
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>LEVEL</Text>
                      <Text style={styles.statValue}>{selected.system.level.value}</Text>
                    </View>
                  )}
                </View>
              )}
              {plainDesc ? (
                <Text style={styles.modalDesc}>{plainDesc}</Text>
              ) : (
                <Text style={styles.modalDescMuted}>No description available.</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  bulkBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  bulkText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
  },
  listContent: {
    paddingBottom: Spacing.xxl,
  },
  sectionHeader: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionTitle: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '75%',
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
  traitText: {
    color: Colors.secondary,
    fontSize: FontSize.xs,
    textTransform: 'capitalize',
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    letterSpacing: 0.5,
  },
  statValue: {
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: 'bold',
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
