import { PF2eCharacter, PF2eItem } from '../types';

// Standard PF2e skill → ability mapping
const SKILL_ABILITY: Record<string, string> = {
  acrobatics: 'dex', arcana: 'int', athletics: 'str', crafting: 'int',
  deception: 'cha', diplomacy: 'cha', intimidation: 'cha', medicine: 'wis',
  nature: 'wis', occultism: 'int', performance: 'cha', religion: 'wis',
  society: 'int', stealth: 'dex', survival: 'wis', thievery: 'dex',
};

type AbilityKey = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ItemSystem = any;

function getItemOfType(items: PF2eItem[], type: string): PF2eItem | undefined {
  return items.find((i) => i.type === type);
}

function itemSys(item: PF2eItem | undefined): ItemSystem | undefined {
  return item?.system as ItemSystem;
}

/**
 * Computes ability modifiers by collecting boosts from ancestry, background,
 * class key ability, and free boosts (system.build).
 */
export function computeAbilityMods(character: PF2eCharacter): Record<AbilityKey, number> {
  const mods: Record<AbilityKey, number> = { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 };
  const items = character.items ?? [];

  // Ancestry boosts
  const ancestrySys = itemSys(getItemOfType(items, 'ancestry'));
  if (ancestrySys?.boosts) {
    for (const boost of Object.values(ancestrySys.boosts) as { selected?: string }[]) {
      if (boost.selected && boost.selected in mods) mods[boost.selected as AbilityKey]++;
    }
  }
  // Ancestry flaws
  if (ancestrySys?.flaws) {
    for (const flaw of Object.values(ancestrySys.flaws) as { selected?: string; value?: string[] }[]) {
      const key = flaw.selected ?? flaw.value?.[0];
      if (key && key in mods) mods[key as AbilityKey]--;
    }
  }

  // Background boosts
  const bgSys = itemSys(getItemOfType(items, 'background'));
  if (bgSys?.boosts) {
    for (const boost of Object.values(bgSys.boosts) as { selected?: string }[]) {
      if (boost.selected && boost.selected in mods) mods[boost.selected as AbilityKey]++;
    }
  }

  // Class key ability
  const classSys = itemSys(getItemOfType(items, 'class'));
  const keyAbility = classSys?.keyAbility?.selected;
  if (keyAbility && keyAbility in mods) mods[keyAbility as AbilityKey]++;

  // Free boosts from system.build
  const build = (character.system as ItemSystem)?.build;
  if (build?.attributes?.boosts) {
    for (const boostSet of Object.values(build.attributes.boosts) as (string[] | { selected?: string })[]) {
      if (Array.isArray(boostSet)) {
        boostSet.forEach((a) => { if (a in mods) mods[a as AbilityKey]++; });
      }
    }
  }

  return mods;
}

/** Proficiency bonus: trained=level+2, expert=level+4, etc. Untrained=0. */
function proficiencyBonus(rank: number, level: number): number {
  return rank > 0 ? level + rank * 2 : 0;
}

export interface ComputedStats {
  abilityMods: Record<AbilityKey, number>;
  saves: { fortitude: number; reflex: number; will: number };
  saveRanks: { fortitude: number; reflex: number; will: number };
  perception: number;
  perceptionRank: number;
  ac: number;
  speed: number;
  hpMax: number;
  skills: Record<string, { mod: number; rank: number }>;
  classDC: number;
}

/**
 * Computes all derived character stats from PF2e v13 source data.
 * Returns null if critical items (class, ancestry) are missing.
 */
export function computeCharacterStats(character: PF2eCharacter): ComputedStats | null {
  const items = character.items ?? [];
  const level = character.system?.details?.level?.value ?? 1;

  const classItem = getItemOfType(items, 'class');
  const ancestryItem = getItemOfType(items, 'ancestry');
  if (!classItem || !ancestryItem) return null;

  const classSys = itemSys(classItem);
  const ancestrySys = itemSys(ancestryItem);
  if (!classSys || !ancestrySys) return null;

  // 1. Ability modifiers
  const abilityMods = computeAbilityMods(character);

  // 2. Saving throws
  const saveRanks = {
    fortitude: (classSys.savingThrows?.fortitude ?? 0) as number,
    reflex: (classSys.savingThrows?.reflex ?? 0) as number,
    will: (classSys.savingThrows?.will ?? 0) as number,
  };
  const saves = {
    fortitude: proficiencyBonus(saveRanks.fortitude, level) + abilityMods.con,
    reflex: proficiencyBonus(saveRanks.reflex, level) + abilityMods.dex,
    will: proficiencyBonus(saveRanks.will, level) + abilityMods.wis,
  };

  // 3. Perception
  const perceptionRank = (classSys.perception ?? 0) as number;
  const perception = proficiencyBonus(perceptionRank, level) + abilityMods.wis;

  // 4. AC
  const equippedArmor = items.find(
    (i) => i.type === 'armor' && (i.system as ItemSystem)?.equipped?.carryType === 'worn'
  ) ?? getItemOfType(items, 'armor');
  const armorSys = itemSys(equippedArmor);
  const armorBonus = (armorSys?.acBonus ?? 0) as number;
  const dexCap = armorSys?.dexCap !== undefined ? (armorSys.dexCap as number) : 99;
  const armorCategory = (armorSys?.category ?? 'unarmored') as string;
  const defenseRank = (classSys.defenses?.[armorCategory] ?? 0) as number;
  const ac = 10 + Math.min(abilityMods.dex, dexCap) + armorBonus + proficiencyBonus(defenseRank, level);

  // 5. Speed
  const baseSpeed = (ancestrySys.speed ?? 25) as number;
  const speedPenalty = (armorSys?.speedPenalty ?? 0) as number;
  const armorStrReq = (armorSys?.strength ?? 0) as number;
  const speed = baseSpeed + (abilityMods.str >= armorStrReq ? 0 : speedPenalty);

  // 6. HP max
  const ancestryHp = (ancestrySys.hp ?? 0) as number;
  const classHp = (classSys.hp ?? 0) as number;
  const hpMax = ancestryHp + (classHp + abilityMods.con) * level;

  // 7. Skills — collect ranks from item rules
  const skillRanks: Record<string, number> = {};
  for (const item of items) {
    const rules = (item.system as ItemSystem)?.rules;
    if (!Array.isArray(rules)) continue;
    for (const rule of rules) {
      if (rule.key === 'ActiveEffectLike' && typeof rule.path === 'string') {
        const match = rule.path.match(/^system\.skills\.(\w+)\.rank$/);
        if (match) {
          const skill = match[1];
          const rank = typeof rule.value === 'number' ? rule.value : 1;
          skillRanks[skill] = Math.max(skillRanks[skill] ?? 0, rank);
        }
        // Handle templated paths like system.skills.{item|flags...}.rank
        const templateMatch = rule.path.match(/^system\.skills\.\{[^}]+\}\.rank$/);
        if (templateMatch) {
          // Resolve the selection from ChoiceSet rules on the same item
          const choiceRule = rules.find(
            (r: { key?: string; flag?: string }) => r.key === 'ChoiceSet' && r.flag
          );
          if (choiceRule?.selection && typeof choiceRule.selection === 'string') {
            const skill = choiceRule.selection;
            const rank = typeof rule.value === 'number' ? rule.value : 1;
            skillRanks[skill] = Math.max(skillRanks[skill] ?? 0, rank);
          }
        }
      }
    }
  }

  const skills: Record<string, { mod: number; rank: number }> = {};
  for (const [skill, ability] of Object.entries(SKILL_ABILITY)) {
    const rank = skillRanks[skill] ?? 0;
    const abilityMod = abilityMods[ability as AbilityKey] ?? 0;
    skills[skill] = {
      rank,
      mod: proficiencyBonus(rank, level) + abilityMod,
    };
  }

  // 8. Class DC
  const keyAbility = classSys.keyAbility?.selected as AbilityKey | undefined;
  const classDC = 10 + proficiencyBonus(1, level) + (keyAbility ? abilityMods[keyAbility] : 0);

  return {
    abilityMods,
    saves,
    saveRanks,
    perception,
    perceptionRank,
    ac,
    speed,
    hpMax,
    skills,
    classDC,
  };
}

/**
 * Extracts character detail fields from items.
 * PF2e v13 stores ancestry, heritage, class, background, and deity as
 * items on the actor rather than in system.details.
 */
export function extractCharacterDetails(character: PF2eCharacter) {
  const details = character.system?.details;
  const items = character.items ?? [];

  const fromItem = (type: string) =>
    items.find((i) => i.type === type)?.name;

  return {
    ancestry: details?.ancestry?.value || fromItem('ancestry'),
    heritage: details?.heritage?.value || fromItem('heritage'),
    class: details?.class?.value || fromItem('class'),
    background: details?.background?.value || fromItem('background'),
    deity: details?.deity?.value || fromItem('deity'),
    level: details?.level?.value ?? 1,
    alignment: details?.alignment?.value,
    gender: details?.gender?.value,
    age: details?.age?.value,
  };
}

/**
 * Extracts currency from treasure items when system.currency is missing.
 * PF2e v13 stores coins as treasure items named "Platinum Pieces", etc.
 */
export function extractCurrency(character: PF2eCharacter): {
  pp: number;
  gp: number;
  sp: number;
  cp: number;
} | null {
  const sysCurrency = character.system?.currency;
  if (sysCurrency && (sysCurrency.pp !== undefined || sysCurrency.gp !== undefined)) {
    return {
      pp: sysCurrency.pp ?? 0,
      gp: sysCurrency.gp ?? 0,
      sp: sysCurrency.sp ?? 0,
      cp: sysCurrency.cp ?? 0,
    };
  }

  // Fall back to treasure items
  const items = character.items ?? [];
  const coinMap: Record<string, 'pp' | 'gp' | 'sp' | 'cp'> = {
    'Platinum Pieces': 'pp',
    'Gold Pieces': 'gp',
    'Silver Pieces': 'sp',
    'Copper Pieces': 'cp',
  };

  const currency = { pp: 0, gp: 0, sp: 0, cp: 0 };
  let found = false;
  for (const item of items) {
    const key = coinMap[item.name];
    if (key && item.type === 'treasure') {
      currency[key] = item.system?.quantity ?? 0;
      found = true;
    }
  }

  return found ? currency : null;
}

/**
 * Returns hero points, checking both the v13 location
 * (system.resources.heroPoints) and the legacy location
 * (system.attributes.heroPoints).
 */
export function getHeroPoints(character: PF2eCharacter): {
  value: number;
  max: number;
} | undefined {
  const hp = character.system?.resources?.heroPoints ?? character.system?.attributes?.heroPoints;
  if (!hp) return undefined;
  return { value: hp.value ?? 0, max: hp.max ?? 3 };
}

/** Format a number as a signed modifier string (e.g. +4, -1, or — for undefined). */
export function formatMod(n: number | undefined | null): string {
  if (n === undefined || n === null) return '—';
  return n >= 0 ? `+${n}` : `${n}`;
}

const SIZE_LABELS: Record<string, string> = {
  tiny: 'Tiny', sm: 'Small', med: 'Medium',
  lrg: 'Large', huge: 'Huge', grg: 'Gargantuan',
};

/**
 * Enriches a PF2eCharacter by filling missing system fields with computed
 * values derived from items/source data. This bridges the gap between
 * PF2e v13 source data (returned by the relay) and the fully-computed
 * data that UI components expect.
 *
 * Only fills fields that are null/undefined/empty — never overwrites
 * existing data from a system that provides computed values natively.
 */
export function enrichCharacterData(character: PF2eCharacter): PF2eCharacter {
  const computed = computeCharacterStats(character);
  if (!computed) return character;

  const charDetails = extractCharacterDetails(character);
  const heroPoints = getHeroPoints(character);
  const items = character.items ?? [];
  const ancestryItem = getItemOfType(items, 'ancestry');
  const ancestrySys = itemSys(ancestryItem);

  // Deep clone to avoid mutation
  const enriched: PF2eCharacter = JSON.parse(JSON.stringify(character));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sys = (enriched.system ??= {}) as any;

  // --- Abilities ---
  if (!sys.abilities || Object.keys(sys.abilities).length === 0) {
    sys.abilities = {};
    for (const [key, mod] of Object.entries(computed.abilityMods)) {
      sys.abilities[key] = { mod, value: 10 + mod * 2 };
    }
  }

  // --- Saves ---
  if (!sys.saves) {
    sys.saves = {
      fortitude: { totalModifier: computed.saves.fortitude, value: computed.saves.fortitude, rank: computed.saveRanks.fortitude },
      reflex: { totalModifier: computed.saves.reflex, value: computed.saves.reflex, rank: computed.saveRanks.reflex },
      will: { totalModifier: computed.saves.will, value: computed.saves.will, rank: computed.saveRanks.will },
    };
  }

  // --- Skills ---
  if (!sys.skills || Object.keys(sys.skills).length === 0) {
    sys.skills = {};
    for (const [skill, data] of Object.entries(computed.skills)) {
      sys.skills[skill] = { totalModifier: data.mod, mod: data.mod, value: data.mod, rank: data.rank };
    }
  }

  // --- Attributes ---
  const attrs = (sys.attributes ??= {});
  if (!attrs.ac?.value && attrs.ac?.value !== 0) {
    attrs.ac = { ...(attrs.ac ?? {}), value: computed.ac };
  }
  if (!attrs.speed?.value && attrs.speed?.value !== 0) {
    attrs.speed = { ...(attrs.speed ?? {}), value: computed.speed };
  }
  if (!attrs.perception?.totalModifier && attrs.perception?.totalModifier !== 0) {
    attrs.perception = {
      totalModifier: computed.perception,
      value: computed.perception,
      rank: computed.perceptionRank,
    };
  }
  if (attrs.hp && !attrs.hp.max) {
    attrs.hp.max = computed.hpMax;
  }
  if (!attrs.classDC) {
    attrs.classDC = { value: computed.classDC, rank: 1 };
  }
  if (!attrs.heroPoints && heroPoints) {
    attrs.heroPoints = heroPoints;
  }

  // --- Traits (size) ---
  if (!sys.traits?.size?.value && ancestrySys?.size) {
    sys.traits ??= {};
    const rawSize = ancestrySys.size as string;
    sys.traits.size = { value: SIZE_LABELS[rawSize] ?? rawSize };
  }

  // --- Details from items ---
  const details = (sys.details ??= {});
  if (!details.class?.value && charDetails.class) {
    details.class = { ...(details.class ?? {}), value: charDetails.class };
  }
  if (!details.ancestry?.value && charDetails.ancestry) {
    details.ancestry = { ...(details.ancestry ?? {}), value: charDetails.ancestry };
  }
  if (!details.heritage?.value && charDetails.heritage) {
    details.heritage = { ...(details.heritage ?? {}), value: charDetails.heritage };
  }
  if (!details.background?.value && charDetails.background) {
    details.background = { ...(details.background ?? {}), value: charDetails.background };
  }
  if (!details.deity?.value && charDetails.deity) {
    details.deity = { ...(details.deity ?? {}), value: charDetails.deity };
  }

  return enriched;
}
