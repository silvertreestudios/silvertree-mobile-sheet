import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, FontSize, Spacing } from '../utils/theme';
import { PF2eItem } from '../types';

interface ItemRowProps {
  item: PF2eItem;
  onPress?: (item: PF2eItem) => void;
}

function formatBulk(bulk?: number): string {
  if (bulk === undefined || bulk === null) return '—';
  if (bulk === 0) return 'L';
  return `${bulk}`;
}

function formatPrice(price?: { value?: { gp?: number; sp?: number; cp?: number } }): string {
  if (!price?.value) return '—';
  const { gp = 0, sp = 0, cp = 0 } = price.value;
  const parts: string[] = [];
  if (gp) parts.push(`${gp} gp`);
  if (sp) parts.push(`${sp} sp`);
  if (cp) parts.push(`${cp} cp`);
  return parts.join(', ') || '—';
}

export default function ItemRow({ item, onPress }: ItemRowProps) {
  const qty = item.system?.quantity ?? 1;
  const bulk = item.system?.bulk?.value ?? item.system?.weight?.value;
  const price = item.system?.price;
  const equipped = item.system?.equipped?.carryType;

  return (
    <TouchableOpacity
      style={styles.row}
      onPress={() => onPress?.(item)}
      activeOpacity={0.7}
    >
      <View style={styles.nameRow}>
        <Text style={styles.name} numberOfLines={1}>
          {item.name}
        </Text>
        {qty > 1 && <Text style={styles.qty}>×{qty}</Text>}
      </View>
      <View style={styles.meta}>
        {equipped && (
          <Text
            style={[
              styles.badge,
              { color: equipped === 'worn' ? Colors.positive : Colors.textMuted },
            ]}
          >
            {equipped}
          </Text>
        )}
        <Text style={styles.metaText}>Bulk {formatBulk(bulk)}</Text>
        <Text style={styles.metaText}>{formatPrice(price)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: '500',
  },
  qty: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    marginLeft: Spacing.xs,
  },
  meta: {
    flexDirection: 'row',
    marginTop: 2,
    gap: Spacing.sm,
  },
  badge: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  metaText: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
  },
});
