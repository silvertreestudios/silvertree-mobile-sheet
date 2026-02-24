import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, FontSize, Spacing } from '../utils/theme';
import { useApp } from '../contexts/AppContext';
import foundryApi from '../api/foundryApi';
import { FoundryClient, RootStackParamList } from '../types';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Settings'>;

export default function SettingsScreen() {
  const navigation = useNavigation<NavProp>();
  const { config, updateConfig } = useApp();

  const [relayUrl, setRelayUrl] = useState(config.relayUrl);
  const [apiKey, setApiKey] = useState(config.apiKey);
  const [clients, setClients] = useState<FoundryClient[]>([]);
  const [selectedClientId, setSelectedClientId] = useState(config.clientId);
  const [isFetchingClients, setIsFetchingClients] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);

  // Keep local state in sync when config loads
  useEffect(() => {
    setRelayUrl(config.relayUrl);
    setApiKey(config.apiKey);
    setSelectedClientId(config.clientId);
  }, [config.relayUrl, config.apiKey, config.clientId]);

  async function fetchClients() {
    if (!apiKey.trim() || !relayUrl.trim()) {
      Alert.alert('Missing Info', 'Please enter both a Relay URL and an API Key first.');
      return;
    }
    setIsFetchingClients(true);
    setClientError(null);
    try {
      // Temporarily set the config so the API uses the latest values
      foundryApi.setConfig({ ...config, apiKey: apiKey.trim(), relayUrl: relayUrl.trim() });
      const fetched = await foundryApi.getClients();
      setClients(fetched);
      if (fetched.length === 0) {
        setClientError('No Foundry worlds are currently connected. Make sure the Foundry module is active and connected.');
      }
    } catch (e: unknown) {
      setClientError(e instanceof Error ? e.message : 'Failed to fetch clients');
    } finally {
      setIsFetchingClients(false);
    }
  }

  async function handleSave() {
    if (!apiKey.trim()) {
      Alert.alert('Missing API Key', 'Please enter your API key.');
      return;
    }
    if (!relayUrl.trim()) {
      Alert.alert('Missing Relay URL', 'Please enter the relay server URL.');
      return;
    }
    await updateConfig({
      apiKey: apiKey.trim(),
      relayUrl: relayUrl.trim(),
      clientId: selectedClientId,
    });
    navigation.navigate('CharacterSelect');
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Text style={styles.title}>⚙️  Connection Setup</Text>
        <Text style={styles.subtitle}>
          Connect to your FoundryVTT instance via the REST API Relay
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Relay Server URL</Text>
        <TextInput
          style={styles.input}
          value={relayUrl}
          onChangeText={setRelayUrl}
          placeholder="https://foundryvtt-rest-api-relay.fly.dev"
          placeholderTextColor={Colors.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
        />
        <Text style={styles.hint}>
          The public relay is available at{' '}
          <Text style={styles.hintLink}>foundryvtt-rest-api-relay.fly.dev</Text>
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>API Key</Text>
        <TextInput
          style={styles.input}
          value={apiKey}
          onChangeText={setApiKey}
          placeholder="Your API key from the relay dashboard"
          placeholderTextColor={Colors.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry={false}
        />
        <Text style={styles.hint}>
          Get your API key from the relay server dashboard after signing up.
        </Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Foundry World (Client)</Text>
          <TouchableOpacity
            style={styles.fetchButton}
            onPress={fetchClients}
            disabled={isFetchingClients}
          >
            {isFetchingClients ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <Text style={styles.fetchButtonText}>Refresh</Text>
            )}
          </TouchableOpacity>
        </View>

        {clientError && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{clientError}</Text>
          </View>
        )}

        {clients.length > 0 ? (
          <View style={styles.clientList}>
            {clients.map((client) => (
              <TouchableOpacity
                key={client.id}
                style={[
                  styles.clientItem,
                  selectedClientId === client.id && styles.clientItemSelected,
                ]}
                onPress={() => setSelectedClientId(client.id)}
              >
                <View style={styles.clientInfo}>
                  <Text style={styles.clientName}>
                    {client.worldName ?? client.name ?? client.id}
                  </Text>
                  <Text style={styles.clientId}>{client.id}</Text>
                  {client.system && (
                    <Text style={styles.clientSystem}>{client.system}</Text>
                  )}
                </View>
                {selectedClientId === client.id && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <Text style={styles.noClients}>
            Tap "Refresh" to load connected Foundry worlds.
          </Text>
        )}

        {!selectedClientId && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Manual Client ID</Text>
            <TextInput
              style={styles.input}
              value={selectedClientId}
              onChangeText={setSelectedClientId}
              placeholder="Enter client ID manually"
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save & Continue →</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Silvertree Mobile Sheet • Pathfinder 2nd Edition
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: FontSize.xxl,
    fontWeight: 'bold',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
  section: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: '600',
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    padding: Spacing.md,
  },
  hint: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    marginTop: Spacing.xs,
  },
  hintLink: {
    color: Colors.info,
  },
  fetchButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.cardLight,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  fetchButtonText: {
    color: Colors.primary,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  errorBox: {
    backgroundColor: '#2d1515',
    borderRadius: 8,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.negative,
    marginBottom: Spacing.sm,
  },
  errorText: {
    color: Colors.negative,
    fontSize: FontSize.sm,
  },
  clientList: {
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  clientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  clientItemSelected: {
    backgroundColor: Colors.cardLight,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  clientId: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  clientSystem: {
    color: Colors.secondary,
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  checkmark: {
    color: Colors.primary,
    fontSize: FontSize.lg,
    fontWeight: 'bold',
  },
  noClients: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    textAlign: 'center',
    paddingVertical: Spacing.lg,
  },
  saveButton: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  saveButtonText: {
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: Spacing.xxl,
  },
  footerText: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
  },
});
