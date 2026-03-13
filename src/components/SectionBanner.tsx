import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSize, Spacing } from '../utils/theme';

interface SectionBannerProps {
  title: string;
}

export default function SectionBanner({ title }: SectionBannerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.sectionBanner,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    marginBottom: 0,
  },
  title: {
    color: Colors.sectionBannerText,
    fontSize: FontSize.lg,
    fontWeight: '600',
    textAlign: 'center',
  },
});
