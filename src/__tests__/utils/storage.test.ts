/**
 * Unit tests for storage utilities.
 * @react-native-async-storage/async-storage is replaced with our in-memory
 * manual mock located at __mocks__/@react-native-async-storage/async-storage.ts
 */

jest.mock('@react-native-async-storage/async-storage');

import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadConfig, saveConfig, clearConfig } from '../../utils/storage';
import { AppConfig } from '../../types';

// jest-expo automatically provides the mock via
// node_modules/jest-expo/src/setup/async-storage.js
// which sets AsyncStorage to @react-native-async-storage/async-storage/jest/build/index.js

const DEFAULT_CONFIG: AppConfig = {
  apiKey: '',
  relayUrl: 'https://foundryvtt-rest-api-relay.fly.dev',
  clientId: '',
  actorUuid: '',
};

describe('storage utilities', () => {
  beforeEach(async () => {
    // Clear any state from a prior test
    await AsyncStorage.clear();
  });

  describe('loadConfig()', () => {
    it('returns default config when nothing is stored', async () => {
      const config = await loadConfig();
      expect(config).toEqual(DEFAULT_CONFIG);
    });

    it('returns stored config merged with defaults', async () => {
      const stored: Partial<AppConfig> = {
        apiKey: 'my-key',
        relayUrl: 'http://localhost:3010',
      };
      await AsyncStorage.setItem('@silvertree:config', JSON.stringify(stored));
      const config = await loadConfig();
      expect(config.apiKey).toBe('my-key');
      expect(config.relayUrl).toBe('http://localhost:3010');
      // Defaults still present for unstored fields
      expect(config.clientId).toBe('');
      expect(config.actorUuid).toBe('');
    });

    it('returns default config on corrupted JSON', async () => {
      await AsyncStorage.setItem('@silvertree:config', 'not-valid-json{{{');
      const config = await loadConfig();
      expect(config).toEqual(DEFAULT_CONFIG);
    });
  });

  describe('saveConfig()', () => {
    it('persists partial config updates', async () => {
      await saveConfig({ apiKey: 'saved-key' });
      const raw = await AsyncStorage.getItem('@silvertree:config');
      const parsed = JSON.parse(raw!);
      expect(parsed.apiKey).toBe('saved-key');
    });

    it('merges new values with existing config', async () => {
      await saveConfig({ apiKey: 'first-key', clientId: 'world-1' });
      await saveConfig({ apiKey: 'updated-key' });
      const config = await loadConfig();
      expect(config.apiKey).toBe('updated-key');
      // clientId should still be there from the first save
      expect(config.clientId).toBe('world-1');
    });

    it('can save all config fields at once', async () => {
      const full: AppConfig = {
        apiKey: 'k',
        relayUrl: 'http://r',
        clientId: 'c',
        actorUuid: 'a',
      };
      await saveConfig(full);
      const config = await loadConfig();
      expect(config).toEqual(full);
    });
  });

  describe('clearConfig()', () => {
    it('removes stored config', async () => {
      await saveConfig({ apiKey: 'to-be-removed' });
      await clearConfig();
      const raw = await AsyncStorage.getItem('@silvertree:config');
      expect(raw).toBeNull();
    });

    it('loadConfig returns defaults after clearConfig', async () => {
      await saveConfig({ apiKey: 'gone' });
      await clearConfig();
      const config = await loadConfig();
      expect(config).toEqual(DEFAULT_CONFIG);
    });
  });
});
