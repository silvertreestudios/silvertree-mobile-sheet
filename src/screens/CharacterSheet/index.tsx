import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors, FontSize, Spacing } from '../../utils/theme';
import { RootStackParamList } from '../../types';
import CharacterHeader from '../../components/CharacterHeader';
import OverviewTab from './OverviewTab';
import AbilitiesTab from './AbilitiesTab';
import SkillsTab from './SkillsTab';
import FeatsTab from './FeatsTab';
import InventoryTab from './InventoryTab';
import { useApp } from '../../contexts/AppContext';

type ScreenProps = NativeStackScreenProps<RootStackParamList, 'CharacterSheet'>;

type TabKey = 'overview' | 'abilities' | 'skills' | 'feats' | 'inventory';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'overview', label: 'Defense' },
  { key: 'abilities', label: 'Abilities' },
  { key: 'skills', label: 'Skills' },
  { key: 'feats', label: 'Features' },
  { key: 'inventory', label: 'Gear' },
];

export default function CharacterSheetScreen({ route }: ScreenProps) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { character: routeCharacter } = route.params;
  const { character: contextCharacter, refreshCharacter, isLoading } = useApp();
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Use context character (most up-to-date) or fall back to route param
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
      case 'overview':
        return <OverviewTab character={character} onRefresh={handleRefresh} />;
      case 'abilities':
        return <AbilitiesTab character={character} />;
      case 'skills':
        return <SkillsTab character={character} />;
      case 'feats':
        return <FeatsTab character={character} />;
      case 'inventory':
        return <InventoryTab character={character} />;
    }
  }

  return (
    <View style={styles.container}>
      {/* Character header */}
      <CharacterHeader character={character} />

      {/* Tab bar */}
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
          <ActivityIndicator size="small" color={Colors.primary} />
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
  },
  tabScroll: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  tab: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    marginHorizontal: Spacing.xs,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  tabActive: {
    borderColor: Colors.tabInactive,
    backgroundColor: Colors.surface,
  },
  tabText: {
    color: Colors.tabInactive,
    fontSize: FontSize.sm,
    fontWeight: '500',
  },
  tabTextActive: {
    color: Colors.tabActive,
    fontWeight: '700',
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
