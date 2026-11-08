import { createSlice } from '@reduxjs/toolkit';

import { getExpansions } from '../engine';
import { MAX_KINGDOM_CARDS } from '../engine/rules';
import { pickCards } from './pickedCardsSlice';

const buildInitialItems = () => {
  const items = {};
  for (const set of Object.keys(getExpansions())) {
    items[set] = { selected: true, min: 0, max: MAX_KINGDOM_CARDS, excludedCards: [] };
  }
  return items;
};

export const expansionsInitialState = {
  drawerOpen: false,
  items: buildInitialItems()
};

const expansionsSlice = createSlice({
  name: 'expansions',
  initialState: expansionsInitialState,
  reducers: {
    toggleExpansion(state, { payload: name }) {
      state.items[name].selected = !state.items[name].selected;
    },
    toggleAllExpansions(state, { payload: selected }) {
      for (const item of Object.values(state.items)) {
        item.selected = selected;
      }
    },
    toggleExpansionDrawer(state) {
      state.drawerOpen = !state.drawerOpen;
    },
    setExpansionLimits(state, { payload: { name, min, max, excludedCards } }) {
      Object.assign(state.items[name], { min, max, excludedCards });
    }
  },
  extraReducers: builder => {
    builder.addCase(pickCards, state => {
      state.drawerOpen = false;
    });
  }
});

export const { toggleExpansion, toggleAllExpansions, toggleExpansionDrawer, setExpansionLimits } =
  expansionsSlice.actions;

export default expansionsSlice.reducer;
