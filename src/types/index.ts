// App configuration stored in AsyncStorage
export interface AppConfig {
  apiKey: string;
  relayUrl: string;
  clientId: string;
  actorUuid: string;
}

// A connected Foundry client (world)
export interface FoundryClient {
  id: string;
  name: string;
  userId?: string;
  worldName?: string;
  system?: string;
  connectedAt?: string;
}

// PF2e ability score
export interface AbilityScore {
  value: number;
  mod: number;
}

// PF2e saving throw
export interface SavingThrow {
  value: number;
  totalModifier?: number;
  breakdown?: string;
  rank?: number; // 0=untrained, 1=trained, 2=expert, 3=master, 4=legendary
}

// PF2e skill
export interface Skill {
  value: number;
  mod?: number;
  label?: string;
  totalModifier?: number;
  breakdown?: string;
  rank?: number; // 0=untrained, 1=trained, 2=expert, 3=master, 4=legendary
}

// PF2e hit points
export interface HitPoints {
  value: number;
  max: number;
  temp?: number;
  tempMax?: number;
}

// PF2e armor class
export interface ArmorClass {
  value: number;
  breakdown?: string;
}

// PF2e speed
export interface Speed {
  value: number | string;
  otherSpeeds?: { type: string; value: number }[];
}

// PF2e perception
export interface Perception {
  value: number;
  totalModifier?: number;
  breakdown?: string;
  rank?: number; // 0=untrained, 1=trained, 2=expert, 3=master, 4=legendary
}

// PF2e item (feat, action, spell, equipment)
export interface PF2eItem {
  _id: string;
  name: string;
  type: string;
  system?: {
    description?: { value?: string };
    quantity?: number;
    price?: { value?: { gp?: number; sp?: number; cp?: number } };
    equipped?: { carryType?: string; inSlot?: boolean };
    level?: { value?: number };
    traits?: { value?: string[]; rarity?: string };
    actionType?: { value?: string };
    actions?: { value?: string | number };
    damage?: { [key: string]: { category?: string; damage?: string; damageType?: string } };
    bulk?: { value?: number };
    weight?: { value?: number };
    slug?: string;
    duration?: { value?: string };
    range?: { value?: string };
    target?: { value?: string };
    area?: { value?: number; type?: string };
  };
  img?: string;
}

// PF2e character / actor
export interface PF2eCharacter {
  _id: string;
  name: string;
  type: string;
  img?: string;
  system?: {
    details?: {
      ancestry?: { value?: string };
      heritage?: { value?: string };
      class?: { value?: string };
      background?: { value?: string };
      level?: { value?: number };
      xp?: { value?: number; max?: number };
      alignment?: { value?: string };
      age?: { value?: string };
      gender?: { value?: string };
      deity?: { value?: string };
    };
    abilities?: {
      str?: AbilityScore;
      dex?: AbilityScore;
      con?: AbilityScore;
      int?: AbilityScore;
      wis?: AbilityScore;
      cha?: AbilityScore;
    };
    attributes?: {
      hp?: HitPoints;
      ac?: ArmorClass;
      speed?: Speed;
      perception?: Perception;
      classDC?: { value?: number; rank?: number };
      shield?: {
        hp?: { value?: number; max?: number };
        raised?: boolean;
        hardness?: number;
      };
      dying?: { value?: number; max?: number };
      wounded?: { value?: number; max?: number };
      heroPoints?: { value?: number; max?: number };
    };
    saves?: {
      fortitude?: SavingThrow;
      reflex?: SavingThrow;
      will?: SavingThrow;
    };
    skills?: { [key: string]: Skill };
    currency?: {
      pp?: number;
      gp?: number;
      sp?: number;
      cp?: number;
    };
    resources?: {
      focus?: { value?: number; max?: number };
    };
    traits?: {
      value?: string[];
      rarity?: string;
      size?: { value?: string };
    };
  };
  items?: PF2eItem[];
}

// A single die term from a roll result
export interface DiceTerm {
  faces?: number;
  number?: number;
  results?: { result: number; active?: boolean }[];
}

// Roll result — matches POST /roll → data.data.roll
export interface RollResult {
  formula: string;
  total: number;
  isCritical: boolean;
  isFumble: boolean;
  dice: DiceTerm[];
}

// API response wrapper
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  suggestion?: string;
}

// Navigation param types
export type RootStackParamList = {
  Settings: undefined;
  CharacterSelect: undefined;
  CharacterSheet: { character: PF2eCharacter };
};
