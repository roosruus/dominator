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

  it('sets limits and excluded cards', () => {
    const store = createStore();
    store.dispatch(setExpansionLimits({ name: 'Alchemy', min: 2, max: 4, excludedCards: ['Transmute'] }));
    expect(store.getState().expansions.items.Alchemy).toEqual({
      selected: true,
      min: 2,
      max: 4,
      excludedCards: ['Transmute']
    });
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
    store.dispatch(setExpansionLimits({ name: 'Seaside', min: 3, max: 6, excludedCards: ['Lighthouse'] }));
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
  const savedSettings = () => JSON.parse(localStorage.getItem('settings'));

  it('saves only selections, not card data', () => {
    const store = createStore();
    selectOnly(store, 'Seaside');
    store.dispatch(setExpansionLimits({ name: 'Seaside', min: 2, max: 5, excludedCards: ['Lighthouse'] }));
    store.dispatch(toggleApplyRecommendedRules());

    const settings = savedSettings();
    expect(settings).toMatchObject({ version: 2, applyRecommendedRules: false });
    expect(settings.expansions.Seaside).toEqual({ selected: true, min: 2, max: 5, excludedCards: ['Lighthouse'] });
    expect(settings.expansions.Guilds).toEqual({ selected: false, min: 0, max: 10, excludedCards: [] });
  });

  it('restores saved settings', () => {
    const store = createStore();
    selectOnly(store, 'Seaside');
    store.dispatch(setExpansionLimits({ name: 'Seaside', min: 2, max: 5, excludedCards: ['Lighthouse'] }));
    store.dispatch(toggleApplyRecommendedRules());

    const restored = createStore().getState();
    expect(restored.expansions.items.Seaside).toEqual({
      selected: true,
      min: 2,
      max: 5,
      excludedCards: ['Lighthouse']
    });
    expect(restored.expansions.items.Guilds.selected).toBe(false);
    expect(restored.otherRules.applyRecommendedRules).toBe(false);
  });

  it('migrates settings saved in the old format and removes them', () => {
    const staleCard = (name, selected) => ({ name, set: 'Seaside', types: ['Action'], cost: { value: 99 }, selected });
    localStorage.setItem(
      'selections',
      JSON.stringify({
        Seaside: {
          selected: true,
          min: 1,
          max: 4,
          cards: { Lighthouse: staleCard('Lighthouse', false), Bazaar: staleCard('Bazaar', true) }
        },
        Guilds: { selected: false, min: 0, max: 10, cards: {} },
        'Removed Expansion': { selected: true, min: 0, max: 10, cards: {} }
      })
    );
    localStorage.setItem('rules', JSON.stringify({ applyRecommendedRules: false }));

    const state = createStore().getState();
    expect(state.expansions.items.Seaside).toEqual({ selected: true, min: 1, max: 4, excludedCards: ['Lighthouse'] });
    expect(state.expansions.items.Guilds.selected).toBe(false);
    expect(state.expansions.items.Alchemy.selected).toBe(true);
    expect(state.expansions.items['Removed Expansion']).toBeUndefined();
    expect(state.otherRules.applyRecommendedRules).toBe(false);

    expect(savedSettings().expansions.Seaside.excludedCards).toEqual(['Lighthouse']);
    expect(localStorage.getItem('selections')).toBeNull();
    expect(localStorage.getItem('rules')).toBeNull();
  });

  it('replaces invalid saved values with defaults', () => {
    localStorage.setItem(
      'settings',
      JSON.stringify({
        version: 2,
        expansions: { Seaside: { selected: 'yes', min: 99, max: -1, excludedCards: ['Lighthouse', 7] }, Guilds: null },
        applyRecommendedRules: 'no'
      })
    );
    const state = createStore().getState();
    expect(state.expansions.items.Seaside).toEqual({ selected: true, min: 0, max: 10, excludedCards: ['Lighthouse'] });
    expect(state.expansions.items.Guilds.selected).toBe(true);
    expect(state.otherRules.applyRecommendedRules).toBe(true);
  });

  it.each([
    ['unreadable JSON', 'settings', '{not json'],
    ['an unknown version', 'settings', JSON.stringify({ version: 99, applyRecommendedRules: false })],
    ['unreadable old-format data', 'selections', '{not json']
  ])('falls back to defaults for %s', (_, key, value) => {
    localStorage.setItem(key, value);
    const state = createStore().getState();
    expect(selectAreAllExpansionsSelected(state)).toBe(true);
    expect(state.otherRules.applyRecommendedRules).toBe(true);
  });
});
