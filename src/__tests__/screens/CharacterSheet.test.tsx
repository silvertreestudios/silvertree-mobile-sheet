import React from 'react';
import { render } from '@testing-library/react-native';
import { mockCharacter } from './__fixtures__/character';
import CharacterSheetScreen from '../../screens/CharacterSheet';
import OverviewTab from '../../screens/CharacterSheet/OverviewTab';
import AbilitiesTab from '../../screens/CharacterSheet/AbilitiesTab';
import SkillsTab from '../../screens/CharacterSheet/SkillsTab';
import FeatsTab from '../../screens/CharacterSheet/FeatsTab';
import InventoryTab from '../../screens/CharacterSheet/InventoryTab';

const mockConfig = {
  apiKey: 'test-key',
  relayUrl: 'https://foundryvtt-rest-api-relay.fly.dev',
  clientId: 'test-client',
  actorUuid: 'Actor.test',
};

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
  useRoute: () => ({ params: { character: mockCharacter } }),
}));

jest.mock('../../contexts/AppContext', () => ({
  useApp: () => ({
    config: {
      apiKey: 'test-key',
      relayUrl: 'https://foundryvtt-rest-api-relay.fly.dev',
      clientId: 'test-client',
      actorUuid: 'Actor.test',
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
    getActor: jest.fn().mockResolvedValue(null),
    increaseAttribute: jest.fn().mockResolvedValue(undefined),
    decreaseAttribute: jest.fn().mockResolvedValue(undefined),
    roll: jest.fn().mockResolvedValue({ total: 15, isCritical: false, isFumble: false, formula: '1d20+4', dice: [] }),
  },
}));

const mockRoute = {
  key: 'CharacterSheet-test',
  name: 'CharacterSheet' as const,
  params: { character: mockCharacter },
};

describe('CharacterSheetScreen', () => {
  it('renders correctly (default Overview tab)', () => {
    const { toJSON } = render(
      <CharacterSheetScreen route={mockRoute as any} />
    );
    expect(toJSON()).toMatchSnapshot();
  });
});

describe('OverviewTab', () => {
  it('renders correctly', () => {
    const { toJSON } = render(
      <OverviewTab character={mockCharacter} onRefresh={jest.fn()} />
    );
    expect(toJSON()).toMatchSnapshot();
  });
});

describe('AbilitiesTab', () => {
  it('renders correctly', () => {
    const { toJSON } = render(<AbilitiesTab character={mockCharacter} />);
    expect(toJSON()).toMatchSnapshot();
  });
});

describe('SkillsTab', () => {
  it('renders correctly', () => {
    const { toJSON } = render(<SkillsTab character={mockCharacter} />);
    expect(toJSON()).toMatchSnapshot();
  });
});

describe('FeatsTab', () => {
  it('renders correctly', () => {
    const { toJSON } = render(<FeatsTab character={mockCharacter} />);
    expect(toJSON()).toMatchSnapshot();
  });
});

describe('InventoryTab', () => {
  it('renders correctly', () => {
    const { toJSON } = render(<InventoryTab character={mockCharacter} />);
    expect(toJSON()).toMatchSnapshot();
  });
});
