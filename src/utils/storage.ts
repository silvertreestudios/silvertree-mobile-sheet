import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppConfig } from '../types';

const CONFIG_KEY = '@silvertree:config';

const DEFAULT_CONFIG: AppConfig = {
  apiKey: '',
  relayUrl: 'https://foundryvtt-rest-api-relay.fly.dev',
  clientId: '',
  actorUuid: '',
};

export async function loadConfig(): Promise<AppConfig> {
  try {
    const raw = await AsyncStorage.getItem(CONFIG_KEY);
    if (!raw) return { ...DEFAULT_CONFIG };
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export async function saveConfig(config: Partial<AppConfig>): Promise<void> {
  const current = await loadConfig();
  const updated = { ...current, ...config };
  await AsyncStorage.setItem(CONFIG_KEY, JSON.stringify(updated));
}

export async function clearConfig(): Promise<void> {
  await AsyncStorage.removeItem(CONFIG_KEY);
}
