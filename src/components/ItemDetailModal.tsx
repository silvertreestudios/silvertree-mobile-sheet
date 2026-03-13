import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Colors, FontSize, Spacing } from '../utils/theme';
import { PF2eItem } from '../types';
import { htmlToPlainText } from '../utils/htmlUtils';

interface ItemDetailModalProps {
  item: PF2eItem | null;
  visible: boolean;
  onClose: () => void;
}

export default function ItemDetailModal({ item, visible, onClose }: ItemDetailModalProps) {
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

const styles = StyleSheet.create({
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
