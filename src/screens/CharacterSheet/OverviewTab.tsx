import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Colors, FontSize, Spacing } from '../../utils/theme';
import { PF2eCharacter } from '../../types';
import StatBox from '../../components/StatBox';
import foundryApi from '../../api/foundryApi';
import { useApp } from '../../contexts/AppContext';

interface Props {
  character: PF2eCharacter;
  onRefresh: () => void;
}

function formatMod(n: number | undefined): string {
  if (n === undefined || n === null) return '—';
  return n >= 0 ? `+${n}` : `${n}`;
}

export default function OverviewTab({ character, onRefresh }: Props) {
  const { config } = useApp();
  const sys = character.system;
  const attrs = sys?.attributes;
  const saves = sys?.saves;
  const hp = attrs?.hp;
  const shield = attrs?.shield;
  const dying = attrs?.dying;
  const wounded = attrs?.wounded;
  const classDC = attrs?.classDC;

  async function adjustHp(delta: number) {
    if (!config.actorUuid || !config.clientId) return;
    try {
      if (delta > 0) {
        await foundryApi.increaseAttribute(
          config.actorUuid,
          'system.attributes.hp.value',
          Math.abs(delta)
        );
      } else {
        await foundryApi.decreaseAttribute(
          config.actorUuid,
          'system.attributes.hp.value',
          Math.abs(delta)
        );
      }
      onRefresh();
    } catch (e: unknown) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to update HP');
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* HP & AC section */}
      <View style={styles.defenseSection}>
        {/* AC shield */}
        <View style={styles.acShieldBlock}>
          <View style={styles.acShield}>
            <Text style={styles.acLabel}>AC</Text>
            <Text style={styles.acValue}>{character.system?.attributes?.ac?.value ?? '—'}</Text>
          </View>
        </View>
        {/* HP display */}
        <View style={styles.hpBlock}>
          <Text style={styles.hpLabel}>HP</Text>
          <View style={styles.hpRow}>
            <TouchableOpacity style={styles.hpBtn} onPress={() => adjustHp(-5)}>
              <Text style={styles.hpBtnText}>−5</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.hpBtn} onPress={() => adjustHp(-1)}>
              <Text style={styles.hpBtnText}>−1</Text>
            </TouchableOpacity>
            <Text style={styles.hpDisplay}>
              <Text style={styles.hpCurrent}>{hp?.value ?? '—'}</Text>
              <Text style={styles.hpMax}>/{hp?.max ?? '—'}</Text>
              {hp?.temp !== undefined && hp.temp > 0 && (
                <Text style={styles.hpTemp}> +{hp.temp}</Text>
              )}
            </Text>
            <TouchableOpacity style={styles.hpBtn} onPress={() => adjustHp(1)}>
              <Text style={styles.hpBtnText}>+1</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.hpBtn} onPress={() => adjustHp(5)}>
              <Text style={styles.hpBtnText}>+5</Text>
            </TouchableOpacity>
          </View>
          {/* HP bar */}
          <View style={styles.hpBarBackground}>
            <View
              style={[
                styles.hpBarFill,
                {
                  width: `${Math.min(100, Math.max(0, ((hp?.value ?? 0) / (hp?.max ?? 1)) * 100))}%`,
                  backgroundColor:
                    (hp?.value ?? 0) / (hp?.max ?? 1) > 0.5
                      ? Colors.hpHigh
                      : (hp?.value ?? 0) / (hp?.max ?? 1) > 0.25
                      ? Colors.hpMed
                      : Colors.hpLow,
                },
              ]}
            />
          </View>
        </View>
      </View>

      {/* Dying / Wounded conditions */}
      {((dying?.value ?? 0) > 0 || (wounded?.value ?? 0) > 0) && (
        <View style={styles.conditionRow}>
          {(dying?.value ?? 0) > 0 && (
            <View style={[styles.conditionBadge, { backgroundColor: Colors.negative }]}>
              <Text style={styles.conditionText}>
                Dying {dying?.value}/{dying?.max ?? 4}
              </Text>
            </View>
          )}
          {(wounded?.value ?? 0) > 0 && (
            <View style={[styles.conditionBadge, { backgroundColor: Colors.warning }]}>
              <Text style={styles.conditionText}>Wounded {wounded?.value}</Text>
            </View>
          )}
        </View>
      )}

      {/* Shield */}
      {shield && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shield</Text>
          <View style={styles.row}>
            <StatBox label="Hardness" value={shield.hardness ?? 0} />
            <StatBox
              label="Shield HP"
              value={`${shield.hp?.value ?? 0}/${shield.hp?.max ?? 0}`}
              color={shield.raised ? Colors.positive : Colors.textPrimary}
            />
            {shield.raised && (
              <View style={[styles.badge, { backgroundColor: Colors.positive }]}>
                <Text style={styles.badgeText}>Raised</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Saving throws */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Saving Throws</Text>
        <View style={styles.row}>
          <StatBox
            label="Fortitude"
            value={saves?.fortitude?.totalModifier ?? 0}
            color={Colors.info}
          />
          <StatBox
            label="Reflex"
            value={saves?.reflex?.totalModifier ?? 0}
            color={Colors.info}
          />
          <StatBox
            label="Will"
            value={saves?.will?.totalModifier ?? 0}
            color={Colors.info}
          />
        </View>
      </View>

      {/* Class DC */}
      {classDC !== undefined && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Class DC</Text>
          <View style={styles.row}>
            <StatBox label="Class DC" value={classDC?.value ?? '—'} />
          </View>
        </View>
      )}

      {/* Character details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Details</Text>
        <View style={styles.detailsGrid}>
          {[
            { label: 'Ancestry', value: sys?.details?.ancestry?.value },
            { label: 'Heritage', value: sys?.details?.heritage?.value },
            { label: 'Class', value: sys?.details?.class?.value },
            { label: 'Background', value: sys?.details?.background?.value },
            { label: 'Alignment', value: sys?.details?.alignment?.value },
            { label: 'Deity', value: sys?.details?.deity?.value },
            { label: 'Gender', value: sys?.details?.gender?.value },
            { label: 'Age', value: sys?.details?.age?.value },
            { label: 'Size', value: sys?.traits?.size?.value },
          ]
            .filter((d) => d.value)
            .map((d) => (
              <View key={d.label} style={styles.detailRow}>
                <Text style={styles.detailLabel}>{d.label}</Text>
                <Text style={styles.detailValue}>{d.value}</Text>
              </View>
            ))}
        </View>
      </View>

      {/* Currency */}
      {sys?.currency && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Currency</Text>
          <View style={styles.row}>
            {sys.currency.pp !== undefined && (
              <StatBox label="PP" value={sys.currency.pp} color={Colors.info} />
            )}
            <StatBox label="GP" value={sys.currency.gp ?? 0} color={Colors.gold} />
            <StatBox label="SP" value={sys.currency.sp ?? 0} color={Colors.textSecondary} />
            <StatBox label="CP" value={sys.currency.cp ?? 0} color="#a0522d" />
          </View>
        </View>
      )}

      {/* Focus points */}
      {sys?.resources?.focus && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Focus Pool</Text>
          <View style={styles.row}>
            <StatBox
              label="Focus"
              value={`${sys.resources.focus.value ?? 0}/${sys.resources.focus.max ?? 0}`}
              color={Colors.secondary}
            />
          </View>
        </View>
      )}
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
  // Defense: AC shield + HP side by side
  defenseSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 10,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  acShieldBlock: {
    alignItems: 'center',
  },
  acShield: {
    width: 56,
    height: 64,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.info,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  acLabel: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  acValue: {
    color: Colors.textPrimary,
    fontSize: FontSize.xxl,
    fontWeight: 'bold',
    lineHeight: FontSize.xxl + 4,
  },
  hpBlock: {
    flex: 1,
  },
  hpLabel: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: Spacing.xs,
  },
  hpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  hpBtn: {
    backgroundColor: Colors.surface,
    borderRadius: 6,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    margin: 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  hpBtnText: {
    color: Colors.textPrimary,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  hpDisplay: {
    flex: 1,
    textAlign: 'center',
  },
  hpCurrent: {
    color: Colors.textPrimary,
    fontSize: FontSize.xl,
    fontWeight: 'bold',
  },
  hpMax: {
    color: Colors.textMuted,
    fontSize: FontSize.md,
  },
  hpTemp: {
    color: Colors.info,
    fontSize: FontSize.xs,
  },
  hpBarBackground: {
    height: 6,
    backgroundColor: Colors.surface,
    borderRadius: 3,
    overflow: 'hidden',
  },
  hpBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  conditionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  conditionBadge: {
    borderRadius: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  conditionText: {
    color: Colors.textPrimary,
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
  },
  badge: {
    borderRadius: 6,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    alignSelf: 'center',
    marginLeft: Spacing.sm,
  },
  badgeText: {
    color: Colors.textPrimary,
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  detailsGrid: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  detailRow: {
    flexDirection: 'row',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  detailLabel: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    width: 100,
  },
  detailValue: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: FontSize.sm,
    textTransform: 'capitalize',
  },
});
