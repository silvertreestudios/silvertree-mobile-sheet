import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { Colors } from '../utils/theme';
import SettingsScreen from '../screens/SettingsScreen';
import CharacterSelectScreen from '../screens/CharacterSelectScreen';
import CharacterSheetScreen from '../screens/CharacterSheet';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Settings"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#0d0d0d',
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
        options={({ route }) => {
          const char = route.params.character;
          const cls = char.system?.details?.class?.value ?? '';
          const level = char.system?.details?.level?.value ?? 1;
          const title = cls ? `${char.name} - ${cls} ${level}` : char.name;
          return { title, headerBackTitle: 'Back' };
        }}
      />
    </Stack.Navigator>
  );
}
