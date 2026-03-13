import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSize, Spacing } from '../utils/theme';
import { PF2eCharacter } from '../types';
import { extractCharacterDetails, getHeroPoints, computeCharacterStats, formatMod } from '../utils/characterUtils';

interface CharacterHeaderProps {
  character: PF2eCharacter;
}

function getHpColor(current: number, max: number): string {
  if (max === 0) return Colors.textPrimary;
  const pct = current / max;
  if (pct > 0.5) return Colors.hpHigh;
  if (pct > 0.25) return Colors.hpMed;
  return Colors.hpLow;
}

export default function CharacterHeader({ character }: CharacterHeaderProps) {
  const charDetails = extractCharacterDetails(character);
  const attrs = character.system?.attributes;
  const hp = attrs?.hp;
  const heroPoints = getHeroPoints(character);
  const computed = computeCharacterStats(character);

  const level = charDetails.level;
  const subTitle = [charDetails.ancestry, charDetails.heritage, charDetails.class]
    .filter(Boolean)
    .join(' ');

  const hpCurrent = hp?.value ?? 0;
  const hpMax = hp?.max ?? computed?.hpMax ?? 0;
  const hpColor = getHpColor(hpCurrent, hpMax);

  return (
    <View style={styles.container}>
      <View style={styles.nameRow}>
        <View style={styles.nameBlock}>
          <Text style={styles.name} numberOfLines={1}>
            {character.name}
          </Text>
          {subTitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subTitle}
            </Text>
          ) : null}
        </View>
        <View style={styles.levelBadge}>
          <Text style={styles.levelLabel}>LVL</Text>
          <Text style={styles.levelValue}>{level}</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        {/* HP */}
        <View style={styles.statBlock}>
          <Text style={styles.statLabel}>HP</Text>
          <Text style={[styles.statValue, { color: hpColor }]}>
            {hpCurrent}
          </Text>
          <Text style={styles.statMax}>/ {hpMax}</Text>
        </View>

        <View style={styles.divider} />

        {/* AC */}
        <View style={styles.statBlock}>
          <Text style={styles.statLabel}>AC</Text>
          <Text style={styles.statValue}>{attrs?.ac?.value ?? computed?.ac ?? '—'}</Text>
        </View>

        <View style={styles.divider} />

        {/* Perception */}
        <View style={styles.statBlock}>
          <Text style={styles.statLabel}>PERC</Text>
          <Text style={styles.statValue}>
            {attrs?.perception?.totalModifier !== undefined
              ? formatMod(attrs.perception.totalModifier)
              : formatMod(computed?.perception)}
          </Text>
        </View>

        <View style={styles.divider} />

        {/* Speed */}
        <View style={styles.statBlock}>
          <Text style={styles.statLabel}>SPD</Text>
          <Text style={styles.statValue}>{attrs?.speed?.value ?? computed?.speed ?? '—'}</Text>
        </View>

        {heroPoints !== undefined && (
          <>
            <View style={styles.divider} />
            <View style={styles.statBlock}>
              <Text style={styles.statLabel}>HERO</Text>
              <Text style={[styles.statValue, { color: Colors.gold }]}>
                {heroPoints.value ?? 0}
              </Text>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  nameBlock: {
    flex: 1,
  },
  name: {
    color: Colors.textPrimary,
    fontSize: FontSize.xl,
    fontWeight: 'bold',
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  levelBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    alignItems: 'center',
    minWidth: 48,
  },
  levelLabel: {
    color: Colors.textPrimary,
    fontSize: FontSize.xs,
    fontWeight: '700',
    letterSpacing: 1,
  },
  levelValue: {
    color: Colors.textPrimary,
    fontSize: FontSize.xl,
    fontWeight: 'bold',
    lineHeight: FontSize.xl + 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statBlock: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  statValue: {
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: 'bold',
  },
  statMax: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.xs,
  },
});
