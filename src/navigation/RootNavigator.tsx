import React, { useEffect, useRef } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { Colors } from '../utils/theme';
import SettingsScreen from '../screens/SettingsScreen';
import CharacterSelectScreen from '../screens/CharacterSelectScreen';
import CharacterSheetScreen from '../screens/CharacterSheet';
import { useApp } from '../contexts/AppContext';
import { navigationRef } from './navigationRef';
import foundryApi from '../api/foundryApi';

const Stack = createNativeStackNavigator<RootStackParamList>();

/** Fetches the character and navigates when a share link was detected. */
function useDeepLinkNavigation() {
  const {
    config,
    pendingShareNavigation,
    clearPendingShareNavigation,
    setCharacter,
  } = useApp();
  const handled = useRef(false);

  useEffect(() => {
    if (!pendingShareNavigation || handled.current) return;
    if (!config.actorUuid || !config.clientId) return;

    handled.current = true;

    let cancelled = false;

    (async () => {
      // Wait for the navigator to be ready (max 5 s) before navigating
      await new Promise<void>((resolve, reject) => {
        if (navigationRef.isReady()) { resolve(); return; }
        let poll: ReturnType<typeof setInterval>;
        const timeout = setTimeout(() => { clearInterval(poll); reject(new Error('Navigation timeout')); }, 5000);
        poll = setInterval(() => {
          if (cancelled) { clearTimeout(timeout); clearInterval(poll); reject(new Error('Cancelled')); return; }
          if (navigationRef.isReady()) { clearTimeout(timeout); clearInterval(poll); resolve(); }
        }, 50);
      });

      try {
        const actor = await foundryApi.getActor(config.actorUuid);
        setCharacter(actor);
        navigationRef.reset({
          index: 2,
          routes: [
            { name: 'Settings' },
            { name: 'CharacterSelect' },
            { name: 'CharacterSheet', params: { character: actor } },
          ],
        });
      } catch (err) {
        // Fetch failed – navigate to CharacterSelect so user isn't stuck on Settings
        navigationRef.reset({
          index: 1,
          routes: [
            { name: 'Settings' },
            { name: 'CharacterSelect' },
          ],
        });
      } finally {
        clearPendingShareNavigation();
      }
    })();

    return () => { cancelled = true; };
  }, [pendingShareNavigation, config, clearPendingShareNavigation, setCharacter]);
}

export default function RootNavigator() {
  useDeepLinkNavigation();

  return (
    <Stack.Navigator
      initialRouteName="Settings"
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.headerBackground,
        },
        headerTintColor: Colors.textPrimary,
        headerTitleStyle: {
          fontWeight: 'bold',
          color: Colors.textPrimary,
        },
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: Colors.background,
        },
      }}
    >
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Silvertree Sheet', headerShown: false }}
      />
      <Stack.Screen
        name="CharacterSelect"
        component={CharacterSelectScreen}
        options={{ title: 'Characters' }}
      />
      <Stack.Screen
        name="CharacterSheet"
        component={CharacterSheetScreen}
        options={({ route }) => ({
          title: route.params.character.name,
          headerBackTitle: 'Characters',
        })}
      />
    </Stack.Navigator>
  );
}
