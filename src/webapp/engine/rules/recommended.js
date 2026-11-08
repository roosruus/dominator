import {
  GROUP_TYPE_CARD_TYPE,
  GROUP_TYPE_CATEGORY,
  GROUP_TYPE_COMPOUND,
  GROUP_TYPE_COST,
  GROUP_TYPE_PLUS_ACTIONS,
  GROUP_TYPE_PLUS_BUYS,
  GROUP_TYPE_PLUS_CARDS
} from './factory';

export const RECOMMENDED_LIMITS = [
  { rule: { value: 1, operator: '>=' }, type: GROUP_TYPE_PLUS_BUYS, min: 1 },
  { rule: { value: 1, operator: '>=' }, type: GROUP_TYPE_PLUS_CARDS, min: 1 },
  { rule: { value: 1, operator: '>=' }, type: GROUP_TYPE_PLUS_ACTIONS, min: 1 },
  { name: 'Attack', type: GROUP_TYPE_CARD_TYPE, min: 0, max: 2 },
  { rule: { value: 0, operator: '==' }, type: GROUP_TYPE_PLUS_ACTIONS, min: 0, max: 5 },
  { name: 'Action', type: GROUP_TYPE_CARD_TYPE, min: 0, max: 2, negate: true },
  { rule: { value: 1, operator: '==' }, type: GROUP_TYPE_COST, min: 0, max: 1 },
  { rule: { value: 2, operator: '==' }, type: GROUP_TYPE_COST, min: 1, max: 2 },
  { rule: { value: 3, operator: '==' }, type: GROUP_TYPE_COST, min: 1, max: 3 },
  { rule: { value: 4, operator: '==' }, type: GROUP_TYPE_COST, min: 2, max: 3 },
  { rule: { value: 5, operator: '==' }, type: GROUP_TYPE_COST, min: 2, max: 4 },
  { rule: { value: 6, operator: '==' }, type: GROUP_TYPE_COST, min: 0, max: 2 },
  { rule: { value: 7, operator: '==' }, type: GROUP_TYPE_COST, min: 0, max: 1 },
  // Allow only one 2-cost +1 action +1 card
  {
    type: GROUP_TYPE_COMPOUND,
    subGroups: [
      { rule: { value: 2, operator: '==' }, type: GROUP_TYPE_COST },
      { rule: { value: 1, operator: '==' }, type: GROUP_TYPE_PLUS_CARDS },
      { rule: { value: 1, operator: '==' }, type: GROUP_TYPE_PLUS_ACTIONS }
    ],
    min: 0,
    max: 1
  },
  // TODO: Don't allow multiple same-cost cards that let you trash or return other cards.
  // TODO: Don't allow more than 3 cards that let you trash or return other cards.
  // TODO: Don't allow more than one cost 3-4 card that lets you trash or return other cards.
  // TODO: Don't allow multiple same-cost cards that provide +2 or more actions.
  // TODO: Don't allow more than one cost 3-5 card that provides +2 or more actions.
  // TODO: Don't allow more than one cost 5-6 card that provides +2 or more actions.
  // TODO: Don't allow more than one cost 2-3 card that provides +2 or more actions.
  // Don't allow more than 1 hand-reducing Attack card
  { name: 'handreducing', type: GROUP_TYPE_CATEGORY, min: 0, max: 1 },
  // Max 2 curse-giving attack cards
  {
    type: GROUP_TYPE_COMPOUND,
    subGroups: [{ name: 'Attack', type: GROUP_TYPE_CARD_TYPE }, { name: 'gaincurse', type: GROUP_TYPE_CATEGORY }],
    min: 0,
    max: 2
  }
  // Include Watchtower with Mountebank
];

export const RECOMMENDED_DISJOINT_CARDS = [
  ['Laboratory', 'Hunting Party', 'Stables'],
  ['King\'s Court', 'Throne Room'],
  ['Armory', 'Ironworks', 'Workshop'],
  ['Woodcutter', 'Nomad Camp'],
  ['Envoy', 'Smithy'],
  ['Chancellor', 'Scavenger'],
  ['Count', 'Mandarin'],
  ['Catacombs', 'Embassy', 'Journeyman'],
  ['Moat', 'Lighthouse'],
  // Don't allow more than 1 treasure-trashing Attack card
  ['Thief', 'Pirate Ship', 'Noble Brigand', 'Rogue', 'Knights', 'Giant', 'Bandit']
];
