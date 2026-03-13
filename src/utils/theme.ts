// Color palette matching Pathbuilder 2e dark theme
export const Colors = {
  // Backgrounds
  background: '#121212',
  surface: '#1e1e1e',
  card: '#252525',
  cardLight: '#2a2d35',

  // Header
  headerBackground: '#000000',

  // Section banners (slate/blue-gray like Pathbuilder's level headers)
  sectionBanner: '#3d4a5c',
  sectionBannerText: '#ffffff',

  // Accents
  primary: '#5c8db5',
  primaryDark: '#4a7a9e',
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
  tabActive: '#ffffff',
  tabInactive: '#888888',
  tabBackground: '#1a1a1a',
  tabPillBorder: '#555555',

  // Borders
  border: '#333333',
  borderLight: '#444444',
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
