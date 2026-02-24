import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, FontSize, Spacing } from '../utils/theme';
import { useApp } from '../contexts/AppContext';
import foundryApi from '../api/foundryApi';
import { PF2eCharacter, RootStackParamList } from '../types';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'CharacterSelect'>;

export default function CharacterSelectScreen() {
  const navigation = useNavigation<NavProp>();
  const { config, updateConfig, setCharacter } = useApp();

  const [characters, setCharacters] = useState<PF2eCharacter[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCharacters = useCallback(async () => {
    if (!config.clientId) {
      setError('No Foundry world selected. Go to Settings and select a world first.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const actors = await foundryApi.getActors();
      setCharacters(actors);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load characters');
    } finally {
      setIsLoading(false);
    }
  }, [config.clientId]);

  useEffect(() => {
    fetchCharacters();
  }, [fetchCharacters]);

  async function handleSelect(character: PF2eCharacter) {
    await updateConfig({ actorUuid: character._id });
    setCharacter(character);
    navigation.navigate('CharacterSheet', { character });
  }

  function getSubtitle(c: PF2eCharacter): string {
    const d = c.system?.details;
    const parts: string[] = [];
    if (d?.ancestry?.value) parts.push(d.ancestry.value);
    if (d?.class?.value) parts.push(d.class.value);
    if (d?.level?.value !== undefined) parts.push(`Level ${d.level.value}`);
    return parts.join(' · ');
  }

  function renderCharacter({ item }: { item: PF2eCharacter }) {
    const hp = item.system?.attributes?.hp;
    const hpText = hp ? `${hp.value}/${hp.max} HP` : '';
    const sub = getSubtitle(item);

    return (
      <TouchableOpacity style={styles.card} onPress={() => handleSelect(item)}>
        <View style={styles.cardLeft}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.charName}>{item.name}</Text>
          {sub ? <Text style={styles.charSub}>{sub}</Text> : null}
          {hpText ? <Text style={styles.charHp}>{hpText}</Text> : null}
        </View>
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Select Character</Text>
        <Text style={styles.subtitle}>{config.clientId || 'No world connected'}</Text>
      </View>

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Settings')}
            style={styles.settingsLink}
          >
            <Text style={styles.settingsLinkText}>Go to Settings →</Text>
          </TouchableOpacity>
        </View>
      )}

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading characters...</Text>
        </View>
      ) : (
        <FlatList
          data={characters}
          keyExtractor={(item) => item._id}
          renderItem={renderCharacter}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={fetchCharacters}
              tintColor={Colors.primary}
            />
          }
          ListEmptyComponent={
            !error ? (
              <View style={styles.center}>
                <Text style={styles.emptyText}>No player characters found.</Text>
                <Text style={styles.emptyHint}>
                  Make sure your Foundry world is connected and has player characters.
                </Text>
              </View>
            ) : null
          }
        />
      )}

      <TouchableOpacity
        style={styles.settingsButton}
        onPress={() => navigation.navigate('Settings')}
      >
        <Text style={styles.settingsButtonText}>⚙️  Settings</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: FontSize.xl,
    fontWeight: 'bold',
  },
  subtitle: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  list: {
    padding: Spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 10,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardLeft: {
    marginRight: Spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Colors.textPrimary,
    fontSize: FontSize.xl,
    fontWeight: 'bold',
  },
  cardContent: {
    flex: 1,
  },
  charName: {
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: '600',
  },
  charSub: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  charHp: {
    color: Colors.positive,
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  arrow: {
    color: Colors.textMuted,
    fontSize: FontSize.xxl,
  },
  errorBox: {
    margin: Spacing.lg,
    backgroundColor: '#2d1515',
    borderRadius: 8,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.negative,
  },
  errorText: {
    color: Colors.negative,
    fontSize: FontSize.sm,
  },
  settingsLink: {
    marginTop: Spacing.sm,
  },
  settingsLinkText: {
    color: Colors.info,
    fontSize: FontSize.sm,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxl,
    marginTop: Spacing.xxl,
  },
  loadingText: {
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  emptyText: {
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyHint: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  settingsButton: {
    margin: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  settingsButtonText: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
  },
});
