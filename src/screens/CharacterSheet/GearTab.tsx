import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
} from 'react-native';
import { Colors, FontSize, Spacing } from '../../utils/theme';
import { PF2eCharacter, PF2eItem } from '../../types';
import ItemRow from '../../components/ItemRow';
import ItemDetailModal from '../../components/ItemDetailModal';

interface Props {
  character: PF2eCharacter;
}

interface GearSection {
  title: string;
  data: PF2eItem[];
}

const GEAR_TYPES = ['weapon', 'armor', 'equipment', 'consumable', 'treasure', 'backpack'];

function categorize(items: PF2eItem[]): GearSection[] {
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
        if (GEAR_TYPES.includes(item.type)) {
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

export default function GearTab({ character }: Props) {
  const [selected, setSelected] = useState<PF2eItem | null>(null);
  const gearItems = (character.items ?? []).filter((i) =>
    [...GEAR_TYPES].includes(i.type)
  );
  const sections = categorize(gearItems);

  return (
    <View style={styles.container}>
      {/* Bulk summary */}
      <View style={styles.bulkBar}>
        <Text style={styles.bulkText}>
          Total Bulk: {totalBulk(gearItems)}
        </Text>
        <Text style={styles.bulkText}>{gearItems.length} items</Text>
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
            <Text style={styles.emptyText}>No items in gear.</Text>
          </View>
        }
        stickySectionHeadersEnabled
      />

      {/* Item detail modal */}
      <ItemDetailModal
        item={selected}
        visible={selected !== null}
        onClose={() => setSelected(null)}
      />
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
});
