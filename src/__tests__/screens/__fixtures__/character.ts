import { PF2eCharacter } from '../../../types';

/** Minimal but realistic PF2e character for snapshot testing. */
export const mockCharacter: PF2eCharacter = {
  _id: 'test-char-001',
  name: 'Valeros',
  type: 'character',
  system: {
    details: {
      ancestry: { value: 'Human' },
      heritage: { value: 'Versatile' },
      class: { value: 'Fighter' },
      background: { value: 'Guard' },
      level: { value: 5 },
      alignment: { value: 'LG' },
      age: { value: '28' },
      gender: { value: 'Male' },
      deity: { value: 'Iomedae' },
    },
    abilities: {
      str: { value: 18, mod: 4 },
      dex: { value: 14, mod: 2 },
      con: { value: 16, mod: 3 },
      int: { value: 10, mod: 0 },
      wis: { value: 12, mod: 1 },
      cha: { value: 8, mod: -1 },
    },
    attributes: {
      hp: { value: 65, max: 80 },
      ac: { value: 22 },
      speed: { value: 25 },
      perception: { value: 9, totalModifier: 9 },
      classDC: { value: 21 },
      heroPoints: { value: 1, max: 3 },
    },
    saves: {
      fortitude: { value: 12, totalModifier: 12 },
      reflex: { value: 9, totalModifier: 9 },
      will: { value: 8, totalModifier: 8 },
    },
    skills: {
      acrobatics: { value: 2, totalModifier: 4, rank: 1 },
      athletics: { value: 6, totalModifier: 10, rank: 2 },
      stealth: { value: 2, totalModifier: 4, rank: 1 },
    },
    currency: {
      gp: 50,
      sp: 12,
      cp: 5,
    },
    resources: {
      focus: { value: 1, max: 2 },
    },
    traits: {
      size: { value: 'med' },
    },
  },
  items: [
    {
      _id: 'item-longsword',
      name: 'Longsword',
      type: 'weapon',
      system: {
        quantity: 1,
        bulk: { value: 1 },
        level: { value: 0 },
        traits: { value: ['versatile-p'] },
      },
    },
    {
      _id: 'item-armor',
      name: 'Plate Armor',
      type: 'armor',
      system: {
        quantity: 1,
        bulk: { value: 4 },
        level: { value: 1 },
      },
    },
    {
      _id: 'item-feat-1',
      name: 'Power Attack',
      type: 'feat',
      system: {
        level: { value: 1 },
        description: { value: '<p>A powerful attack.</p>' },
        traits: { value: ['fighter', 'flourish'] },
      },
    },
    {
      _id: 'item-action-1',
      name: 'Strike',
      type: 'action',
      system: {
        actionType: { value: 'action' },
        actions: { value: 1 },
        description: { value: '<p>Make an attack.</p>' },
      },
    },
    {
      _id: 'item-spell-1',
      name: 'Heal',
      type: 'spell',
      system: {
        level: { value: 1 },
        description: { value: '<p>Channel positive energy.</p>' },
        traits: { value: ['healing', 'positive'] },
      },
    },
    {
      _id: 'item-consumable-1',
      name: 'Healing Potion',
      type: 'consumable',
      system: {
        quantity: 2,
        bulk: { value: 0 },
        level: { value: 1 },
        traits: { value: ['healing', 'potion'] },
      },
    },
  ],
};
