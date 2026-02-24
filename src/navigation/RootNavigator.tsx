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
          backgroundColor: Colors.surface,
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
