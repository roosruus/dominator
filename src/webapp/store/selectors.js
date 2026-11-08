import { createSelector } from '@reduxjs/toolkit';

import { MAX_KINGDOM_CARDS } from '../engine/rules';
import { GROUP_TYPE_SET } from '../engine/rules/factory';
import { RECOMMENDED_DISJOINT_CARDS, RECOMMENDED_LIMITS } from '../engine/rules/recommended';

const selectExpansionItems = state => state.expansions.items;

export const selectIsExpansionDrawerOpen = state => state.expansions.drawerOpen;
export const selectPickedCards = state => state.pickedCards;
export const selectIsApplyRecommendedRules = state => state.otherRules.applyRecommendedRules;
export const selectCardsInExpansion = (state, expansion) => state.expansions.items[expansion].cards;

export const selectExpansionList = createSelector([selectExpansionItems], items =>
  Object.entries(items).map(([name, props]) => ({ name, ...props }))
);

const selectSelectedExpansionNames = createSelector([selectExpansionList], expansions =>
  expansions.filter(expansion => expansion.selected).map(expansion => expansion.name)
);

export const selectAreAllExpansionsSelected = state =>
  selectSelectedExpansionNames(state).length === selectExpansionList(state).length;

export const selectIsNoExpansionsSelected = state => selectSelectedExpansionNames(state).length === 0;

export const selectSelectedExpansionsText = state =>
  selectAreAllExpansionsSelected(state) ? 'All' : selectSelectedExpansionNames(state).join(', ');

const selectExcludedCardNames = createSelector([selectExpansionList], expansions =>
  expansions
    .flatMap(expansion => Object.values(expansion.cards))
    .filter(card => !card.selected)
    .map(card => card.name)
);

export const selectCurrentRules = createSelector(
  [selectExpansionList, selectExcludedCardNames, selectIsApplyRecommendedRules],
  (expansions, excludedCardNames, applyRecommendedRules) => {
    const selectedExpansions = expansions.filter(expansion => expansion.selected);
    const limits = selectedExpansions.map(({ name, min, max }) => ({ type: GROUP_TYPE_SET, name, min, max }));
    return {
      numKingdomCards: MAX_KINGDOM_CARDS,
      filters: {
        include: {
          groups: selectedExpansions.map(({ name }) => ({ type: GROUP_TYPE_SET, name })),
          limits: applyRecommendedRules ? [...limits, ...RECOMMENDED_LIMITS] : limits,
          specificCards: []
        },
        exclude: {
          groups: [],
          specificCards: excludedCardNames
        },
        disjointCards: applyRecommendedRules ? RECOMMENDED_DISJOINT_CARDS : []
      }
    };
  }
);
