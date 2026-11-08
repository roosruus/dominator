import { configureStore } from '@reduxjs/toolkit';

import expansions, { expansionsInitialState } from './expansionsSlice';
import otherRules, { otherRulesInitialState } from './otherRulesSlice';
import pickedCards from './pickedCardsSlice';
import { loadPersistedState, persistSelections } from './persistence';

export const createStore = () => {
  const store = configureStore({
    reducer: { expansions, pickedCards, otherRules },
    preloadedState: loadPersistedState(expansionsInitialState, otherRulesInitialState)
  });
  persistSelections(store);
  return store;
};
