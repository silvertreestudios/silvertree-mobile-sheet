import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors, FontSize, Spacing } from '../../utils/theme';
import { RootStackParamList } from '../../types';
import CharacterHeader from '../../components/CharacterHeader';
import AboutTab from './AboutTab';
import DefenseTab from './DefenseTab';
import OffenseTab from './OffenseTab';
import SkillsTab from './SkillsTab';
import SpellsTab from './SpellsTab';
import FeatsTab from './FeatsTab';
import GearTab from './GearTab';
import { useApp } from '../../contexts/AppContext';

type ScreenProps = NativeStackScreenProps<RootStackParamList, 'CharacterSheet'>;

type TabKey = 'about' | 'defense' | 'offense' | 'gear' | 'skills' | 'spells' | 'feats';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'about', label: 'About' },
  { key: 'defense', label: 'Defense' },
  { key: 'offense', label: 'Offense' },
  { key: 'gear', label: 'Gear' },
  { key: 'skills', label: 'Skills' },
  { key: 'spells', label: 'Spells' },
  { key: 'feats', label: 'Feats' },
];

export default function CharacterSheetScreen({ route }: ScreenProps) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { character: routeCharacter } = route.params;
  const { character: contextCharacter, refreshCharacter, isLoading } = useApp();
  const [activeTab, setActiveTab] = useState<TabKey>('about');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const character = contextCharacter ?? routeCharacter;

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refreshCharacter();
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshCharacter]);

  function renderTab() {
    switch (activeTab) {
      case 'about':
        return <AboutTab character={character} />;
      case 'defense':
        return <DefenseTab character={character} onRefresh={handleRefresh} />;
      case 'offense':
        return <OffenseTab character={character} />;
      case 'skills':
        return <SkillsTab character={character} />;
      case 'spells':
        return <SpellsTab character={character} />;
      case 'feats':
        return <FeatsTab character={character} />;
      case 'gear':
        return <GearTab character={character} />;
    }
  }

  return (
    <View style={styles.container}>
      {/* Pathbuilder-style header */}
      <CharacterHeader character={character} />

      {/* Pill-style tab bar */}
      <View style={styles.tabBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.key && styles.tabTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Tab content */}
      <View style={styles.content}>
        {isLoading && !isRefreshing ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          renderTab()
        )}
      </View>

      {/* Refresh indicator */}
      {isRefreshing && (
        <View style={styles.refreshBar}>
          <ActivityIndicator size="small" color={Colors.textPrimary} />
          <Text style={styles.refreshText}>Refreshing...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  tabBar: {
    backgroundColor: Colors.tabBackground,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: Spacing.sm,
  },
  tabScroll: {
    paddingHorizontal: Spacing.sm,
  },
  tab: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    marginHorizontal: Spacing.xs,
    borderRadius: 20,
    alignItems: 'center',
  },
  tabActive: {
    borderWidth: 1,
    borderColor: Colors.tabPillBorder,
    backgroundColor: Colors.surface,
  },
  tabText: {
    color: Colors.tabInactive,
    fontSize: FontSize.md,
    fontWeight: '500',
  },
  tabTextActive: {
    color: Colors.tabActive,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  refreshText: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
    marginLeft: Spacing.xs,
  },
});
