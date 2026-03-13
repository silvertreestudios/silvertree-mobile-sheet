import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, FontSize, Spacing } from '../utils/theme';

interface StatBoxProps {
  label: string;
  value: number | string;
  subtitle?: string;
  color?: string;
  onPress?: () => void;
  size?: 'small' | 'medium' | 'large';
}

export default function StatBox({
  label,
  value,
  subtitle,
  color = Colors.textPrimary,
  onPress,
  size = 'medium',
}: StatBoxProps) {
  const valueSize =
    size === 'large' ? FontSize.xxxl : size === 'medium' ? FontSize.xxl : FontSize.xl;
  const labelSize = size === 'large' ? FontSize.sm : FontSize.xs;

  const content = (
    <View style={styles.container}>
      <Text style={[styles.label, { fontSize: labelSize }]}>{label}</Text>
      <Text style={[styles.value, { color, fontSize: valueSize }]}>
        {typeof value === 'number' && value >= 0 ? (value > 0 ? `+${value}` : `${value}`) : value}
      </Text>
      {subtitle !== undefined && (
        <Text style={styles.subtitle}>{subtitle}</Text>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} style={styles.wrapper}>
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={styles.wrapper}>{content}</View>;
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    margin: Spacing.xs,
  },
  container: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: Spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  label: {
    color: Colors.textSecondary,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  value: {
    fontWeight: 'bold',
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
    marginTop: 2,
  },
});
