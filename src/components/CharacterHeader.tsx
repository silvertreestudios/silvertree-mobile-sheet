import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSize, Spacing } from '../utils/theme';
import { PF2eCharacter } from '../types';

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
  const attrs = character.system?.attributes;
  const hp = attrs?.hp;
  const ac = attrs?.ac;
  const heroPoints = attrs?.heroPoints;

  const hpCurrent = hp?.value ?? 0;
  const hpMax = hp?.max ?? 0;
  const hpColor = getHpColor(hpCurrent, hpMax);

  return (
    <View style={styles.container}>
      {/* AC shield */}
      <View style={styles.acBlock}>
        <View style={styles.acShield}>
          <Text style={styles.acLabel}>AC</Text>
          <Text style={styles.acValue}>{ac?.value ?? '—'}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* HP */}
      <View style={styles.statBlock}>
        <Text style={styles.statLabel}>HP</Text>
        <Text style={[styles.statValue, { color: hpColor }]}>
          {hpCurrent}
          <Text style={styles.statMax}>/{hpMax}</Text>
        </Text>
      </View>

      <View style={styles.divider} />

      {/* Perception */}
      <View style={styles.statBlock}>
        <Text style={styles.statLabel}>PERC</Text>
        <Text style={styles.statValue}>
          {attrs?.perception?.totalModifier !== undefined
            ? (attrs.perception.totalModifier >= 0
                ? `+${attrs.perception.totalModifier}`
                : `${attrs.perception.totalModifier}`)
            : '—'}
        </Text>
      </View>

      <View style={styles.divider} />

      {/* Speed */}
      <View style={styles.statBlock}>
        <Text style={styles.statLabel}>SPD</Text>
        <Text style={styles.statValue}>{attrs?.speed?.value ?? '—'}</Text>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  acBlock: {
    alignItems: 'center',
    marginRight: Spacing.xs,
  },
  acShield: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.info,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
  },
  acLabel: {
    color: Colors.textMuted,
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  acValue: {
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: 'bold',
    lineHeight: FontSize.lg + 2,
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
    fontSize: FontSize.sm,
    fontWeight: 'normal',
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.xs,
  },
});
