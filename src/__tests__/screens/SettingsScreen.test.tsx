import React from 'react';
import { render } from '@testing-library/react-native';
import SettingsScreen from '../../screens/SettingsScreen';

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn() }),
}));

jest.mock('../../contexts/AppContext', () => ({
  useApp: () => ({
    config: {
      apiKey: '',
      relayUrl: 'https://foundryvtt-rest-api-relay.fly.dev',
      clientId: '',
      actorUuid: '',
    },
    updateConfig: jest.fn(),
    character: null,
    setCharacter: jest.fn(),
    refreshCharacter: jest.fn(),
    isLoading: false,
    error: null,
    clearError: jest.fn(),
  }),
}));

jest.mock('../../api/foundryApi', () => ({
  __esModule: true,
  default: {
    setConfig: jest.fn(),
    getClients: jest.fn().mockResolvedValue([]),
  },
}));

describe('SettingsScreen', () => {
  it('renders correctly', () => {
    const { toJSON } = render(<SettingsScreen />);
    expect(toJSON()).toMatchSnapshot();
  });
});
