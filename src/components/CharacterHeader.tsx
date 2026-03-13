import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSize, Spacing } from '../utils/theme';
import { PF2eCharacter } from '../types';

interface CharacterHeaderProps {
  character: PF2eCharacter;
}

export default function CharacterHeader({ character }: CharacterHeaderProps) {
  const details = character.system?.details;
  const cls = details?.class?.value ?? '';
  const level = details?.level?.value ?? 1;

  const titleParts = [character.name];
  if (cls) titleParts.push('-');
  if (cls) titleParts.push(`${cls} ${level}`);
  const title = titleParts.join(' ');

  return (
    <View style={styles.container}>
      <Text style={styles.menuIcon} accessible={false}>☰</Text>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.headerBackground,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  menuIcon: {
    color: Colors.textPrimary,
    fontSize: FontSize.xl,
    marginRight: Spacing.lg,
  },
  title: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: '600',
  },
});
