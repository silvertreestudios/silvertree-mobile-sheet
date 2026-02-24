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
import { htmlToPlainText } from '../../utils/htmlUtils';

interface Props {
  character: PF2eCharacter;
}

const ACTION_TYPES = ['action', 'reaction', 'free', 'passive'];
const FEAT_TYPES = ['feat', 'classFeature', 'ancestryFeature', 'heritage'];

function ActionCost({ actions }: { actions?: string | number }) {
  if (actions === undefined || actions === null || actions === '') return null;
  const n = Number(actions);
  if (!isNaN(n)) {
    return (
      <View style={styles.actionCost}>
        <Text style={styles.actionCostText}>{'◆'.repeat(Math.min(n, 3))}</Text>
      </View>
    );
  }
  const symbols: Record<string, string> = {
    free: '◇',
    reaction: '↺',
    passive: '—',
  };
  return (
    <View style={styles.actionCost}>
      <Text style={styles.actionCostText}>{symbols[String(actions)] ?? String(actions)}</Text>
    </View>
  );
}

function ItemDetailModal({
  item,
  visible,
  onClose,
}: {
  item: PF2eItem | null;
  visible: boolean;
  onClose: () => void;
}) {
  if (!item) return null;
  const desc = item.system?.description?.value ?? '';
  const plainDesc = htmlToPlainText(desc);
  const traits = item.system?.traits?.value ?? [];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle} numberOfLines={2}>
              {item.name}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
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
            {plainDesc ? (
              <Text style={styles.modalDesc}>{plainDesc}</Text>
            ) : (
              <Text style={styles.modalDescMuted}>No description available.</Text>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export default function FeatsTab({ character }: Props) {
  const items = character.items ?? [];
  const [selected, setSelected] = useState<PF2eItem | null>(null);

  const actions = items.filter((i) => ACTION_TYPES.includes(i.type));
  const feats = items.filter((i) => FEAT_TYPES.includes(i.type));
  const spells = items.filter((i) => i.type === 'spell');

  function getActionCostValue(
    actionType: string | undefined,
    numericActions: string | number | undefined
  ): string | number | undefined {
    if (actionType === 'passive') return 'passive';
    if (actionType === 'reaction') return 'reaction';
    if (actionType === 'free') return 'free';
    return numericActions;
  }

  function renderAction(item: PF2eItem) {
    const actionType = item.system?.actionType?.value;
    const actions = item.system?.actions?.value;
    const costValue = getActionCostValue(actionType, actions);
    return (
      <TouchableOpacity
        key={item._id}
        style={styles.itemRow}
        onPress={() => setSelected(item)}
        activeOpacity={0.7}
      >
        <View style={styles.itemLeft}>
          <ActionCost actions={costValue} />
        </View>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemArrow}>›</Text>
      </TouchableOpacity>
    );
  }

  function renderFeat(item: PF2eItem) {
    const level = item.system?.level?.value;
    return (
      <TouchableOpacity
        key={item._id}
        style={styles.itemRow}
        onPress={() => setSelected(item)}
        activeOpacity={0.7}
      >
        <Text style={styles.itemName} numberOfLines={1}>
          {item.name}
        </Text>
        {level !== undefined && (
          <Text style={styles.itemLevel}>Lvl {level}</Text>
        )}
        <Text style={styles.itemArrow}>›</Text>
      </TouchableOpacity>
    );
  }

  function renderSpell(item: PF2eItem) {
    const level = item.system?.level?.value;
    const traits = item.system?.traits?.value?.slice(0, 2) ?? [];
    return (
      <TouchableOpacity
        key={item._id}
        style={styles.itemRow}
        onPress={() => setSelected(item)}
        activeOpacity={0.7}
      >
        <Text style={styles.itemName} numberOfLines={1}>
          {item.name}
        </Text>
        <View style={styles.spellMeta}>
          {level !== undefined && (
            <Text style={styles.itemLevel}>Rank {level}</Text>
          )}
          {traits.map((t) => (
            <View key={t} style={styles.traitBadgeSmall}>
              <Text style={styles.traitTextSmall}>{t}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.itemArrow}>›</Text>
      </TouchableOpacity>
    );
  }

  function renderSection(title: string, items: PF2eItem[], renderer: (item: PF2eItem) => React.ReactElement | null) {
    if (items.length === 0) return null;
    return (
      <View style={styles.section} key={title}>
        <Text style={styles.sectionTitle}>{title} ({items.length})</Text>
        <View style={styles.card}>
          {items.map(renderer)}
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {renderSection('Actions & Reactions', actions, renderAction)}
      {renderSection('Feats & Features', feats, renderFeat)}
      {renderSection('Spells', spells, renderSpell)}

      {actions.length === 0 && feats.length === 0 && spells.length === 0 && (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No feats, actions, or spells found.</Text>
        </View>
      )}

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
  content: { padding: Spacing.md },
  section: { marginBottom: Spacing.lg },
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
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  itemLeft: {
    marginRight: Spacing.sm,
    width: 32,
  },
  itemName: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: FontSize.md,
  },
  itemLevel: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    marginRight: Spacing.sm,
  },
  itemArrow: {
    color: Colors.textMuted,
    fontSize: FontSize.lg,
  },
  actionCost: {
    minWidth: 28,
    alignItems: 'center',
  },
  actionCostText: {
    color: Colors.secondary,
    fontSize: FontSize.sm,
  },
  spellMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.sm,
    gap: Spacing.xs,
  },
  traitBadgeSmall: {
    backgroundColor: Colors.surface,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  traitTextSmall: {
    color: Colors.textMuted,
    fontSize: 9,
    textTransform: 'capitalize',
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
  // Modal styles
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
  traitText: {
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
