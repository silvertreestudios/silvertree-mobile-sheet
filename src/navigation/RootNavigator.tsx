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

    (async () => {
      try {
        const actor = await foundryApi.getActor(config.actorUuid);
        setCharacter(actor);

        // Wait briefly for the navigator to be ready
        const waitForNav = () =>
          new Promise<void>((resolve) => {
            const check = () => {
              if (navigationRef.isReady()) {
                resolve();
              } else {
                setTimeout(check, 50);
              }
            };
            check();
          });

        await waitForNav();
        navigationRef.reset({
          index: 0,
          routes: [
            { name: 'Settings' },
            { name: 'CharacterSelect' },
            { name: 'CharacterSheet', params: { character: actor } },
          ],
        });
      } catch {
        // Fetch failed – fall through to the normal Settings screen
      } finally {
        clearPendingShareNavigation();
      }
    })();
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
