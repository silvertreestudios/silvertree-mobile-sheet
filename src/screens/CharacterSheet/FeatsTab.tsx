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
import SectionBanner from '../../components/SectionBanner';
import ItemDetailModal from '../../components/ItemDetailModal';

interface Props {
  character: PF2eCharacter;
}

const FEAT_TYPE_LABELS: Record<string, string> = {
  classFeature: 'CLASS FEAT',
  feat: 'FEAT',
  ancestryFeature: 'ANCESTRY FEAT',
  heritage: 'HERITAGE',
};

interface FeatGroup {
  label: string;
  items: PF2eItem[];
}

function groupFeats(items: PF2eItem[]): FeatGroup[] {
  const groups: Record<string, PF2eItem[]> = {};

  for (const item of items) {
    // Try to determine feat category from type or traits
    const traits = item.system?.traits?.value ?? [];
    let category = 'FEAT';

    if (item.type === 'classFeature' || traits.includes('class')) {
      category = 'CLERIC FEAT'; // Will use class name ideally
    } else if (item.type === 'ancestryFeature' || traits.includes('ancestry')) {
      category = 'ANCESTRY FEAT';
    } else if (traits.includes('general')) {
      category = 'GENERAL FEAT';
    } else if (traits.includes('skill')) {
      category = 'SKILL FEAT';
    } else if (item.type === 'feat') {
      category = 'GENERAL FEAT';
    }

    if (!groups[category]) groups[category] = [];
    groups[category].push(item);
  }

  // Sort order: class, general, ancestry/human, skill
  const order = ['CLERIC FEAT', 'CLASS FEAT', 'GENERAL FEAT', 'ANCESTRY FEAT', 'HUMAN FEAT', 'SKILL FEAT', 'FEAT'];
  const result: FeatGroup[] = [];
  for (const label of order) {
    if (groups[label] && groups[label].length > 0) {
      result.push({ label, items: groups[label] });
      delete groups[label];
    }
  }
  // Add any remaining
  for (const [label, items] of Object.entries(groups)) {
    if (items.length > 0) result.push({ label, items });
  }
  return result;
}

export default function FeatsTab({ character }: Props) {
  const items = character.items ?? [];
  const [selected, setSelected] = useState<PF2eItem | null>(null);

  const feats = items.filter((i) =>
    ['feat', 'classFeature', 'ancestryFeature', 'heritage'].includes(i.type)
  );
  const featGroups = groupFeats(feats);

  // Specials: actions, class features that aren't feats
  const specials = items.filter((i) =>
    ['action', 'reaction', 'free', 'passive'].includes(i.type) ||
    (i.type === 'classFeature' && !feats.includes(i))
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SectionBanner title="Feats" />

      {featGroups.map((group) => (
        <View key={group.label}>
          <Text style={styles.categoryTitle}>{group.label}</Text>
          {group.items.map((item) => {
            const level = item.system?.level?.value;
            return (
              <TouchableOpacity
                key={item._id}
                style={styles.featRow}
                onPress={() => setSelected(item)}
                activeOpacity={0.7}
              >
                <Text style={styles.featName} numberOfLines={1}>
                  {item.name}
                </Text>
                {level !== undefined && (
                  <View style={styles.levelBadge}>
                    <Text style={styles.levelText}>{level}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      ))}

      {/* Specials section */}
      {specials.length > 0 && (
        <>
          <SectionBanner title="Specials" />
          {specials.map((item) => (
            <TouchableOpacity
              key={item._id}
              style={styles.featRow}
              onPress={() => setSelected(item)}
              activeOpacity={0.7}
            >
              <Text style={styles.featName} numberOfLines={1}>
                {item.name}
              </Text>
            </TouchableOpacity>
          ))}
        </>
      )}

      {feats.length === 0 && specials.length === 0 && (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No feats or specials found.</Text>
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
  content: { paddingBottom: Spacing.xxl },
  categoryTitle: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xs,
  },
  featRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  featName: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: FontSize.md,
  },
  levelBadge: {
    backgroundColor: Colors.sectionBanner,
    borderRadius: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    minWidth: 28,
    alignItems: 'center',
  },
  levelText: {
    color: Colors.textPrimary,
    fontSize: FontSize.sm,
    fontWeight: '600',
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
