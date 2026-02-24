// Color palette inspired by Pathbuilder 2e
export const Colors = {
  // Backgrounds
  background: '#1a1a2e',
  surface: '#16213e',
  card: '#0f3460',
  cardLight: '#1a3a5c',

  // Accents
  primary: '#e94560',
  primaryDark: '#c73652',
  secondary: '#f5a623',
  gold: '#d4a017',

  // Text
  textPrimary: '#ffffff',
  textSecondary: '#a0aec0',
  textMuted: '#718096',

  // Status
  positive: '#48bb78',
  negative: '#fc8181',
  warning: '#f6ad55',
  info: '#63b3ed',

  // HP colors
  hpHigh: '#48bb78',
  hpMed: '#f6ad55',
  hpLow: '#fc8181',

  // Ranks
  untrained: '#718096',
  trained: '#63b3ed',
  expert: '#9f7aea',
  master: '#f6ad55',
  legendary: '#e94560',

  // Tab bar
  tabActive: '#e94560',
  tabInactive: '#718096',
  tabBackground: '#0d0d1a',

  // Borders
  border: '#2d3748',
  borderLight: '#4a5568',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const FontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const RANK_LABELS = ['Untrained', 'Trained', 'Expert', 'Master', 'Legendary'];
export const RANK_COLORS = [
  Colors.untrained,
  Colors.trained,
  Colors.expert,
  Colors.master,
  Colors.legendary,
];

export const ABILITY_LABELS: Record<string, string> = {
  str: 'STR',
  dex: 'DEX',
  con: 'CON',
  int: 'INT',
  wis: 'WIS',
  cha: 'CHA',
};

export const SKILL_LABELS: Record<string, string> = {
  acrobatics: 'Acrobatics',
  arcana: 'Arcana',
  athletics: 'Athletics',
  crafting: 'Crafting',
  deception: 'Deception',
  diplomacy: 'Diplomacy',
  intimidation: 'Intimidation',
  medicine: 'Medicine',
  nature: 'Nature',
  occultism: 'Occultism',
  performance: 'Performance',
  religion: 'Religion',
  society: 'Society',
  stealth: 'Stealth',
  survival: 'Survival',
  thievery: 'Thievery',
};
