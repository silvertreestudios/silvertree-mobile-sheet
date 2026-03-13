import React from 'react';
import { render } from '@testing-library/react-native';
import { mockCharacter } from './__fixtures__/character';
import CharacterSheetScreen from '../../screens/CharacterSheet';
import AboutTab from '../../screens/CharacterSheet/AboutTab';
import DefenseTab from '../../screens/CharacterSheet/DefenseTab';
import OffenseTab from '../../screens/CharacterSheet/OffenseTab';
import SkillsTab from '../../screens/CharacterSheet/SkillsTab';
import FeatsTab from '../../screens/CharacterSheet/FeatsTab';
import SpellsTab from '../../screens/CharacterSheet/SpellsTab';
import GearTab from '../../screens/CharacterSheet/GearTab';

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

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  setParams: jest.fn(),
  dispatch: jest.fn(),
  reset: jest.fn(),
  isFocused: jest.fn().mockReturnValue(true),
  canGoBack: jest.fn().mockReturnValue(true),
  getId: jest.fn(),
  getParent: jest.fn(),
  getState: jest.fn(),
  addListener: jest.fn(),
  removeListener: jest.fn(),
  setOptions: jest.fn(),
  push: jest.fn(),
  pop: jest.fn(),
  popToTop: jest.fn(),
  replace: jest.fn(),
} as any;

const mockRoute = {
  key: 'CharacterSheet-test',
  name: 'CharacterSheet' as const,
  params: { character: mockCharacter },
};

describe('CharacterSheetScreen', () => {
  it('renders correctly (default Overview tab)', () => {
    const { toJSON } = render(
      <CharacterSheetScreen navigation={mockNavigation} route={mockRoute as any} />
    );
    expect(toJSON()).toMatchSnapshot();
  });
});

describe('AboutTab', () => {
  it('renders correctly', () => {
    const { toJSON } = render(<AboutTab character={mockCharacter} />);
    expect(toJSON()).toMatchSnapshot();
  });
});

describe('DefenseTab', () => {
  it('renders correctly', () => {
    const { toJSON } = render(
      <DefenseTab character={mockCharacter} onRefresh={jest.fn()} />
    );
    expect(toJSON()).toMatchSnapshot();
  });
});

describe('OffenseTab', () => {
  it('renders correctly', () => {
    const { toJSON } = render(<OffenseTab character={mockCharacter} />);
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

describe('SpellsTab', () => {
  it('renders correctly', () => {
    const { toJSON } = render(<SpellsTab character={mockCharacter} />);
    expect(toJSON()).toMatchSnapshot();
  });
});

describe('GearTab', () => {
  it('renders correctly', () => {
    const { toJSON } = render(<GearTab character={mockCharacter} />);
    expect(toJSON()).toMatchSnapshot();
  });
});
