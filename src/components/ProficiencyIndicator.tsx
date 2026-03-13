import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSize, Spacing } from '../utils/theme';

interface ProficiencyIndicatorProps {
  rank: number; // 0=untrained, 1=trained, 2=expert, 3=master, 4=legendary
  showLabels?: boolean;
}

const RANK_LETTERS = ['T', 'E', 'M', 'L'];

export default function ProficiencyIndicator({ rank, showLabels = true }: ProficiencyIndicatorProps) {
  return (
    <View style={styles.container}>
      {showLabels && (
        <View style={styles.labelRow}>
          {RANK_LETTERS.map((letter) => (
            <Text key={letter} style={styles.label}>{letter}</Text>
          ))}
        </View>
      )}
      <View style={styles.circleRow}>
        {RANK_LETTERS.map((letter, index) => {
          const rankIndex = index + 1; // T=1, E=2, M=3, L=4
          const isActive = rank >= rankIndex;
          const isCurrent = rank === rankIndex;
          return (
            <View
              key={letter}
              style={[
                styles.circle,
                isActive ? styles.circleFilled : styles.circleEmpty,
              ]}
            >
              {isCurrent && (
                <Text style={styles.xMark}>✕</Text>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const CIRCLE_SIZE = 22;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  labelRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  label: {
    color: Colors.textMuted,
    fontSize: 9,
    fontWeight: '600',
    width: CIRCLE_SIZE + 2,
    textAlign: 'center',
  },
  circleRow: {
    flexDirection: 'row',
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    marginHorizontal: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleFilled: {
    backgroundColor: Colors.textPrimary,
  },
  circleEmpty: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.textMuted,
  },
  xMark: {
    color: Colors.background,
    fontSize: 12,
    fontWeight: 'bold',
    lineHeight: 14,
  },
});
