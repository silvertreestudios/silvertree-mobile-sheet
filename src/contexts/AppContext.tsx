import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppConfig, PF2eCharacter } from '../types';
import { loadConfig, saveConfig } from '../utils/storage';
import foundryApi from '../api/foundryApi';
import { getShareParamsFromUrl, clearShareParamsFromUrl } from '../utils/shareLink';

interface AppContextValue {
  config: AppConfig;
  updateConfig: (partial: Partial<AppConfig>) => Promise<void>;
  character: PF2eCharacter | null;
  setCharacter: (c: PF2eCharacter | null) => void;
  refreshCharacter: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  pendingShareNavigation: boolean;
  clearPendingShareNavigation: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<AppConfig>({
    apiKey: '',
    relayUrl: 'https://foundryvtt-rest-api-relay.fly.dev',
    clientId: '',
    actorUuid: '',
  });
  const [character, setCharacter] = useState<PF2eCharacter | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingShareNavigation, setPendingShareNavigation] = useState(false);

  useEffect(() => {
    async function init() {
      const savedConfig = await loadConfig();
      const shareConfig = await getShareParamsFromUrl();

      if (shareConfig) {
        // Share link params take precedence over saved config
        setConfig(shareConfig);
        foundryApi.setConfig(shareConfig);
        await saveConfig(shareConfig);
        clearShareParamsFromUrl();
        setPendingShareNavigation(true);
      } else {
        setConfig(savedConfig);
        foundryApi.setConfig(savedConfig);
      }
    }
    init();
  }, []);

  const updateConfig = useCallback(async (partial: Partial<AppConfig>) => {
    const newConfig = { ...config, ...partial };
    setConfig(newConfig);
    foundryApi.setConfig(newConfig);
    await saveConfig(newConfig);
  }, [config]);

  const refreshCharacter = useCallback(async () => {
    if (!config.actorUuid || !config.clientId) return;
    setIsLoading(true);
    setError(null);
    try {
      const updated = await foundryApi.getActor(config.actorUuid);
      setCharacter(updated);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load character');
    } finally {
      setIsLoading(false);
    }
  }, [config.actorUuid, config.clientId]);

  const clearError = useCallback(() => setError(null), []);
  const clearPendingShareNavigation = useCallback(() => setPendingShareNavigation(false), []);

  return (
    <AppContext.Provider
      value={{
        config,
        updateConfig,
        character,
        setCharacter,
        refreshCharacter,
        isLoading,
        error,
        clearError,
        pendingShareNavigation,
        clearPendingShareNavigation,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
