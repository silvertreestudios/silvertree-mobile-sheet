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
import {
  extractCharacterDetails,
  extractCurrency,
  getHeroPoints,
  computeCharacterStats,
} from '../../utils/characterUtils';

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
  const charDetails = extractCharacterDetails(character);
  const currency = extractCurrency(character);
  const heroPoints = getHeroPoints(character);
  const computed = computeCharacterStats(character);

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
      {/* HP section */}
      <View style={styles.hpSection}>
        <Text style={styles.sectionTitle}>Hit Points</Text>
        <View style={styles.hpRow}>
          <TouchableOpacity style={styles.hpBtn} onPress={() => adjustHp(-1)}>
            <Text style={styles.hpBtnText}>−1</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.hpBtn} onPress={() => adjustHp(-5)}>
            <Text style={styles.hpBtnText}>−5</Text>
          </TouchableOpacity>
          <View style={styles.hpDisplay}>
            <Text style={styles.hpCurrent}>{hp?.value ?? '—'}</Text>
            <Text style={styles.hpMax}>/ {hp?.max ?? computed?.hpMax ?? '?'}</Text>
            {hp?.temp !== undefined && hp.temp > 0 && (
              <Text style={styles.hpTemp}>+{hp.temp} temp</Text>
            )}
          </View>
          <TouchableOpacity style={styles.hpBtn} onPress={() => adjustHp(5)}>
            <Text style={styles.hpBtnText}>+5</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.hpBtn} onPress={() => adjustHp(1)}>
            <Text style={styles.hpBtnText}>+1</Text>
          </TouchableOpacity>
        </View>

        {/* HP bar — only show when max HP is known */}
        {(hp?.max ?? computed?.hpMax) !== undefined && (hp?.max ?? computed?.hpMax ?? 0) > 0 && (
          <View style={styles.hpBarBackground}>
            <View
              style={[
                styles.hpBarFill,
                {
                  width: `${Math.min(100, Math.max(0, ((hp?.value ?? 0) / (hp?.max ?? computed?.hpMax ?? 1)) * 100))}%`,
                  backgroundColor:
                    (hp?.value ?? 0) / (hp?.max ?? computed?.hpMax ?? 1) > 0.5
                      ? Colors.hpHigh
                      : (hp?.value ?? 0) / (hp?.max ?? computed?.hpMax ?? 1) > 0.25
                      ? Colors.hpMed
                      : Colors.hpLow,
                },
              ]}
            />
          </View>
        )}

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
      </View>

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
            value={formatMod(saves?.fortitude?.totalModifier ?? computed?.saves.fortitude)}
            color={Colors.info}
          />
          <StatBox
            label="Reflex"
            value={formatMod(saves?.reflex?.totalModifier ?? computed?.saves.reflex)}
            color={Colors.info}
          />
          <StatBox
            label="Will"
            value={formatMod(saves?.will?.totalModifier ?? computed?.saves.will)}
            color={Colors.info}
          />
        </View>
      </View>

      {/* Class DC */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Class DC</Text>
        <View style={styles.row}>
          <StatBox label="Class DC" value={classDC?.value ?? computed?.classDC ?? '—'} />
        </View>
      </View>

      {/* Character details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Details</Text>
        <View style={styles.detailsGrid}>
          {[
            { label: 'Ancestry', value: charDetails.ancestry },
            { label: 'Heritage', value: charDetails.heritage },
            { label: 'Class', value: charDetails.class },
            { label: 'Background', value: charDetails.background },
            { label: 'Alignment', value: charDetails.alignment },
            { label: 'Deity', value: charDetails.deity },
            { label: 'Gender', value: charDetails.gender },
            { label: 'Age', value: charDetails.age },
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
      {currency && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Currency</Text>
          <View style={styles.row}>
            {currency.pp > 0 && (
              <StatBox label="PP" value={currency.pp} color={Colors.info} />
            )}
            <StatBox label="GP" value={currency.gp} color={Colors.gold} />
            <StatBox label="SP" value={currency.sp} color={Colors.textSecondary} />
            <StatBox label="CP" value={currency.cp} color="#a0522d" />
          </View>
        </View>
      )}

      {/* Hero Points */}
      {heroPoints && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hero Points</Text>
          <View style={styles.row}>
            <StatBox
              label="Hero"
              value={`${heroPoints.value}/${heroPoints.max}`}
              color={Colors.gold}
            />
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
  hpSection: {
    backgroundColor: Colors.card,
    borderRadius: 10,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  hpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  hpBtn: {
    backgroundColor: Colors.surface,
    borderRadius: 6,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    margin: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  hpBtnText: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  hpDisplay: {
    alignItems: 'center',
    marginHorizontal: Spacing.md,
    minWidth: 100,
  },
  hpCurrent: {
    color: Colors.textPrimary,
    fontSize: FontSize.xxxl,
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
    height: 8,
    backgroundColor: Colors.surface,
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: Spacing.xs,
  },
  hpBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  conditionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: Spacing.sm,
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
