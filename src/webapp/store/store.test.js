import { describe, expect, it } from 'vitest';

import { createStore } from '.';
import { setExpansionLimits, toggleAllExpansions, toggleExpansion, toggleExpansionDrawer } from './expansionsSlice';
import { toggleApplyRecommendedRules } from './otherRulesSlice';
import { pickCards, shuffleKingdom } from './pickedCardsSlice';
import {
  selectAreAllExpansionsSelected,
  selectCurrentRules,
  selectExpansionList,
  selectIsNoExpansionsSelected,
  selectSelectedExpansionsText
} from './selectors';
import { RECOMMENDED_DISJOINT_CARDS, RECOMMENDED_LIMITS } from '../engine/rules/recommended';

const selectOnly = (store, ...expansions) => {
  store.dispatch(toggleAllExpansions(false));
  for (const expansion of expansions) {
    store.dispatch(toggleExpansion(expansion));
  }
};

describe('expansions', () => {
  it('starts with every expansion selected and default limits', () => {
    const store = createStore();
    const expansions = selectExpansionList(store.getState());
    expect(expansions.length).toBeGreaterThan(10);
    expect(expansions.every(({ selected, min, max }) => selected && min === 0 && max === 10)).toBe(true);
    expect(selectSelectedExpansionsText(store.getState())).toBe('All');
  });

  it('toggles expansions individually and all at once', () => {
    const store = createStore();
    selectOnly(store, 'Seaside', 'Guilds');
    expect(selectSelectedExpansionsText(store.getState())).toBe('Seaside, Guilds');
    expect(selectAreAllExpansionsSelected(store.getState())).toBe(false);

    store.dispatch(toggleAllExpansions(false));
    expect(selectIsNoExpansionsSelected(store.getState())).toBe(true);

    store.dispatch(toggleAllExpansions(true));
    expect(selectAreAllExpansionsSelected(store.getState())).toBe(true);
  });

  it('sets limits and card selections without dropping other cards', () => {
    const store = createStore();
    const cardsBefore = Object.keys(store.getState().expansions.items.Alchemy.cards);
    const transmute = store.getState().expansions.items.Alchemy.cards.Transmute;

    store.dispatch(
      setExpansionLimits({ name: 'Alchemy', min: 2, max: 4, cards: { Transmute: { ...transmute, selected: false } } })
    );

    const alchemy = store.getState().expansions.items.Alchemy;
    expect(alchemy).toMatchObject({ min: 2, max: 4 });
    expect(alchemy.cards.Transmute.selected).toBe(false);
    expect(Object.keys(alchemy.cards)).toEqual(cardsBefore);
  });

  it('closes the expansion drawer when cards are picked', () => {
    const store = createStore();
    store.dispatch(toggleExpansionDrawer());
    expect(store.getState().expansions.drawerOpen).toBe(true);
    store.dispatch(pickCards({ kingdomCards: [], additionalCards: [] }));
    expect(store.getState().expansions.drawerOpen).toBe(false);
  });
});

describe('selectCurrentRules', () => {
  it('includes the selected expansions with their limits and excluded cards', () => {
    const store = createStore();
    selectOnly(store, 'Seaside');
    const lighthouse = store.getState().expansions.items.Seaside.cards.Lighthouse;
    store.dispatch(
      setExpansionLimits({ name: 'Seaside', min: 3, max: 6, cards: { Lighthouse: { ...lighthouse, selected: false } } })
    );
    store.dispatch(toggleApplyRecommendedRules());

    const { filters } = selectCurrentRules(store.getState());
    expect(filters.include.groups).toEqual([{ type: 'set', name: 'Seaside' }]);
    expect(filters.include.limits).toEqual([{ type: 'set', name: 'Seaside', min: 3, max: 6 }]);
    expect(filters.exclude.specificCards).toEqual(['Lighthouse']);
    expect(filters.disjointCards).toEqual([]);
  });

  it('adds the recommended rules when enabled', () => {
    const store = createStore();
    const { filters } = selectCurrentRules(store.getState());
    expect(filters.include.limits).toEqual(expect.arrayContaining(RECOMMENDED_LIMITS));
    expect(filters.disjointCards).toBe(RECOMMENDED_DISJOINT_CARDS);
  });

  it('returns the same object until the state changes', () => {
    const store = createStore();
    expect(selectCurrentRules(store.getState())).toBe(selectCurrentRules(store.getState()));
  });
});

describe('shuffleKingdom', () => {
  it('stores a kingdom from the selected expansions', () => {
    const store = createStore();
    selectOnly(store, 'Seaside');
    store.dispatch(shuffleKingdom());
    const { kingdomCards } = store.getState().pickedCards;
    expect(kingdomCards).toHaveLength(10);
    expect(kingdomCards.every(card => card.set === 'Seaside')).toBe(true);
  });
});

describe('persistence', () => {
  it('restores selections and rules from localStorage', () => {
    const store = createStore();
    selectOnly(store, 'Seaside');
    store.dispatch(setExpansionLimits({ name: 'Seaside', min: 2, max: 5, cards: {} }));
    store.dispatch(toggleApplyRecommendedRules());

    const restored = createStore().getState();
    expect(restored.expansions.items.Seaside).toMatchObject({ selected: true, min: 2, max: 5 });
    expect(restored.expansions.items.Guilds.selected).toBe(false);
    expect(restored.otherRules.applyRecommendedRules).toBe(false);
  });

  it('falls back to defaults when saved data is unreadable', () => {
    localStorage.setItem('selections', '{not json');
    localStorage.setItem('rules', 'undefined');
    const state = createStore().getState();
    expect(selectAreAllExpansionsSelected(state)).toBe(true);
    expect(state.otherRules.applyRecommendedRules).toBe(true);
  });
});
