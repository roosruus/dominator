import { getExpansions } from '../engine';
import { MAX_KINGDOM_CARDS } from '../engine/rules';
import {
  GROUP_TYPE_SET,
  GROUP_TYPE_CARD_TYPE,
  GROUP_TYPE_COST,
  GROUP_TYPE_CATEGORY,
  GROUP_TYPE_PLUS_BUYS,
  GROUP_TYPE_PLUS_CARDS,
  GROUP_TYPE_PLUS_ACTIONS,
  GROUP_TYPE_COMPOUND
} from '../engine/rules/factory';

export const getExpansionList = state =>
  Object.entries(state.expansions.items).map(([expansion, props]) => ({ name: expansion, ...props }));

const getSelectedExpansions = state =>
  Object.entries(state.expansions.items)
    .filter(([, props]) => props.selected)
    .map(([expansion]) => expansion);

const getExcludedCards = state =>
  Object.entries(state.expansions.items)
    .map(([, props]) => Object.values(props.cards))
    .reduce((a, b) => a.concat(b), [])
    .filter(card => !card.selected)
    .map(card => card.name);

const numAllExpansions = Object.entries(getExpansions()).length;
export const areAllExpansionsSelected = state => getSelectedExpansions(state).length === numAllExpansions;
export const isNoExpansionsSelected = state => getSelectedExpansions(state).length === 0;

export const getSelectedExpansionsText = state => {
  let text;
  const selectedExpansions = getSelectedExpansions(state);
  if (selectedExpansions.length === numAllExpansions) {
    text = 'All';
  } else {
    text = selectedExpansions.join(', ');
  }
  return text;
};

export const isExpansionDrawerOpen = state => state.expansions.drawerOpen;

const getSelectedExpansionLimits = state =>
  Object.entries(state.expansions.items)
    .filter(([, props]) => props.selected)
    .map(([expansion, props]) => ({ type: GROUP_TYPE_SET, name: expansion, min: props.min, max: props.max }));

export const getCurrentRules = state => {
  const rules = {
    numKingdomCards: MAX_KINGDOM_CARDS,
    filters: {
      include: {
        groups: getSelectedExpansions(state).map(expansion => ({ name: expansion, type: GROUP_TYPE_SET })),
        limits: getSelectedExpansionLimits(state),
        specificCards: []
      },
      exclude: {
        groups: [],
        specificCards: getExcludedCards(state)
      },
      disjointCards: []
    }
  };
  if (isApplyRecommendedRules(state)) {
    rules.filters.include.limits = rules.filters.include.limits.concat([
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
    ]);
    rules.filters.disjointCards = rules.filters.disjointCards.concat([
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
    ]);
  }
  return rules;
};

export const createGetCardsInExpansion = state => expansion => state.expansions.items[expansion].cards;

export const isApplyRecommendedRules = state => state.otherRules.applyRecommendedRules;
