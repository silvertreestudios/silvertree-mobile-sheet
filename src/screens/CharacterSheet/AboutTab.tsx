import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Colors, FontSize, Spacing, ABILITY_LABELS } from '../../utils/theme';
import { PF2eCharacter } from '../../types';
import { formatMod } from '../../utils/formatters';
import ProficiencyIndicator from '../../components/ProficiencyIndicator';

interface Props {
  character: PF2eCharacter;
}

export default function AboutTab({ character }: Props) {
  const sys = character.system;
  const details = sys?.details;
  const attrs = sys?.attributes;
  const abilities = sys?.abilities ?? {};
  const classDC = attrs?.classDC;
  const heroPoints = attrs?.heroPoints;

  const level = details?.level?.value ?? 1;
  const xp = details?.xp;
  const size = sys?.traits?.size?.value ?? 'Medium';
  const speed = attrs?.speed?.value ?? '—';
  const keyAbility = details?.keyability?.value ?? 'wis';
  const keyAbilityLabel = keyAbility.charAt(0).toUpperCase() + keyAbility.slice(1);
  const keyAbilityMod = abilities[keyAbility as keyof typeof abilities]?.mod ?? 0;

  const abilityKeys = ['str', 'dex', 'con', 'int', 'wis', 'cha'] as const;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Level display */}
      <View style={styles.levelRow}>
        <View style={styles.levelBox}>
          <Text style={styles.levelText}>LEVEL {level}</Text>
        </View>
      </View>

      {/* XP */}
      {xp !== undefined && (
        <View style={styles.xpRow}>
          <Text style={styles.xpText}>XP: {xp.value ?? 0}</Text>
        </View>
      )}

      {/* Hero Points */}
      {heroPoints !== undefined && (
        <View style={styles.heroRow}>
          <Text style={styles.heroLabel}>Hero Points</Text>
          <View style={styles.heroStars}>
            {Array.from({ length: heroPoints.max ?? 3 }).map((_, i) => (
              <Text key={i} style={[styles.heroStar, i < (heroPoints.value ?? 0) && styles.heroStarActive]}>
                ✦
              </Text>
            ))}
          </View>
        </View>
      )}

      {/* Class DC */}
      {classDC !== undefined && (
        <View style={styles.dcSection}>
          <View style={styles.dcRow}>
            <Text style={styles.dcLabel}>{details?.class?.value ?? 'Class'} DC {classDC.value ?? '—'}</Text>
            <ProficiencyIndicator rank={classDC.rank ?? 0} />
            <Text style={styles.breakdownText}>{keyAbilityLabel}{'\n'}{formatMod(keyAbilityMod)}</Text>
            <Text style={styles.breakdownText}>Prof{'\n'}{formatMod(classDC.rank ? classDC.rank * 2 + level : 0)}</Text>
            <Text style={styles.breakdownText}>Item{'\n'}0</Text>
          </View>
        </View>
      )}

      {/* Size & Speed */}
      <View style={styles.sizeSpeedRow}>
        <View style={styles.sizeBlock}>
          <Text style={styles.sizeIcon}>↕</Text>
          <Text style={styles.sizeText}>{size} Size</Text>
        </View>
        <View style={styles.speedBlock}>
          <Text style={styles.speedText}>{speed} ft. Speed</Text>
          <Text style={styles.speedIcon}>🏃</Text>
        </View>
      </View>

      {/* Ability Scores - 2x3 grid */}
      <View style={styles.abilityGrid}>
        {abilityKeys.map((key) => {
          const ability = abilities[key];
          const mod = ability?.mod ?? 0;
          return (
            <View key={key} style={styles.abilityRow}>
              <View style={styles.abilityBadge}>
                <Text style={styles.abilityBadgeText}>{ABILITY_LABELS[key]}</Text>
              </View>
              <Text style={styles.abilityMod}>{formatMod(mod)}</Text>
            </View>
          );
        })}
      </View>

      {/* Personal details */}
      <View style={styles.detailsSection}>
        {[
          { label: 'Gender', value: details?.gender?.value },
          { label: 'Deity', value: details?.deity?.value },
          { label: 'Age', value: details?.age?.value },
        ].filter(d => d.value).map((detail) => {
          if (detail.label === 'Deity') {
            const ageValue = details?.age?.value;
            return (
              <View key={detail.label} style={styles.detailsRow}>
                <View style={styles.detailFieldHalf}>
                  <Text style={styles.detailFieldLabel}>Deity</Text>
                  <Text style={styles.detailFieldValue}>{detail.value}</Text>
                </View>
                {ageValue && (
                  <View style={styles.detailFieldHalf}>
                    <Text style={styles.detailFieldLabel}>Age</Text>
                    <Text style={styles.detailFieldValue}>{ageValue}</Text>
                  </View>
                )}
              </View>
            );
          }
          // Age is rendered alongside Deity when both exist; render standalone otherwise
          if (detail.label === 'Age' && details?.deity?.value) return null;
          return (
            <View key={detail.label} style={styles.detailField}>
              <Text style={styles.detailFieldLabel}>{detail.label}</Text>
              <Text style={styles.detailFieldValue}>{detail.value}</Text>
            </View>
          );
        })}

        {/* Languages */}
        {details?.languages?.value && details.languages.value.length > 0 && (
          <View style={styles.detailField}>
            <Text style={styles.detailFieldLabel}>Languages</Text>
            <Text style={styles.detailFieldValue}>
              {details.languages.value.join(', ')}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: Spacing.xxl },
  levelRow: {
    alignItems: 'flex-start',
    padding: Spacing.lg,
    paddingBottom: 0,
  },
  levelBox: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xxl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  levelText: {
    color: Colors.textPrimary,
    fontSize: FontSize.xxxl,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  xpRow: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  xpText: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    backgroundColor: Colors.card,
    borderRadius: 6,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    overflow: 'hidden',
    textAlign: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    backgroundColor: Colors.card,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    borderRadius: 8,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  heroLabel: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    marginRight: Spacing.md,
  },
  heroStars: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  heroStar: {
    fontSize: FontSize.xxl,
    color: Colors.textMuted,
  },
  heroStarActive: {
    color: Colors.textPrimary,
  },
  dcSection: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dcRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dcLabel: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: '600',
    flex: 1,
  },
  breakdownText: {
    color: Colors.textMuted,
    fontSize: 10,
    textAlign: 'center',
    marginLeft: Spacing.xs,
    minWidth: 30,
  },
  sizeSpeedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  sizeBlock: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sizeIcon: {
    color: Colors.textMuted,
    fontSize: FontSize.xl,
    marginRight: Spacing.sm,
  },
  sizeText: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
  },
  speedBlock: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  speedText: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    marginRight: Spacing.sm,
  },
  speedIcon: {
    fontSize: FontSize.lg,
  },
  abilityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    gap: Spacing.md,
  },
  abilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '42%',
  },
  abilityBadge: {
    backgroundColor: Colors.sectionBanner,
    borderRadius: 4,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    minWidth: 48,
    alignItems: 'center',
  },
  abilityBadgeText: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: 'bold',
  },
  abilityMod: {
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: '600',
    marginLeft: Spacing.sm,
  },
  detailsSection: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    gap: Spacing.md,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  detailField: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  detailFieldHalf: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  detailFieldLabel: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    marginBottom: Spacing.xs,
  },
  detailFieldValue: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
  },
});
