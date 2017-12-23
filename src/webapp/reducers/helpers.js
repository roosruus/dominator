import { getExpansions } from '../engine';
import { MAX_KINGDOM_CARDS } from '../engine/rules';
import { GROUP_TYPE_SET } from '../engine/rules/factory';

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

export const getCurrentRules = state => ({
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
    }
  }
});

export const createGetCardsInExpansion = state => expansion => state.expansions.items[expansion].cards;
