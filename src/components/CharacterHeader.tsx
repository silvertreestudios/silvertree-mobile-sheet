import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, Alert, Platform } from 'react-native';
import { Colors, FontSize, Spacing } from '../utils/theme';
import { PF2eCharacter } from '../types';
import { useApp } from '../contexts/AppContext';
import { buildShareUrl } from '../utils/shareLink';

interface CharacterHeaderProps {
  character: PF2eCharacter;
}

export default function CharacterHeader({ character }: CharacterHeaderProps) {
  const { config } = useApp();
  const details = character.system?.details;
  const cls = details?.class?.value ?? '';
  const level = details?.level?.value ?? 1;

  const titleParts = [character.name];
  if (cls) titleParts.push('-');
  if (cls) titleParts.push(`${cls} ${level}`);
  const title = titleParts.join(' ');

  async function handleShare() {
    const shareUrl = buildShareUrl(config);
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: `${character.name} – Silvertree Sheet`,
          url: shareUrl,
        });
      } else if (Platform.OS === 'web') {
        await navigator.clipboard.writeText(shareUrl);
        Alert.alert('Link Copied', 'Character link copied to clipboard.');
      } else {
        await Share.share({
          title: `${character.name} – Silvertree Sheet`,
          message: shareUrl,
          url: shareUrl,
        });
      }
    } catch {
      // User cancelled or share failed – no action needed
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.menuIcon} accessible={false}>☰</Text>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <TouchableOpacity
        style={styles.shareButton}
        onPress={handleShare}
        accessibilityLabel="Share character link"
        accessibilityRole="button"
      >
        <Text style={styles.shareIcon}>🔗</Text>
      </TouchableOpacity>
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
  shareButton: {
    padding: Spacing.sm,
    marginLeft: Spacing.sm,
  },
  shareIcon: {
    fontSize: FontSize.lg,
  },
});
