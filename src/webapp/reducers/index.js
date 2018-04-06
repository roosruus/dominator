import { combineReducers } from 'redux';

import { getExpansions } from '../engine';
import { MAX_KINGDOM_CARDS } from '../engine/rules';
import {
  TOGGLE_EXPANSION,
  TOGGLE_ALL_EXPANSIONS,
  TOGGLE_EXPANSION_DRAWER,
  TOGGLE_CARD,
  SET_EXPANSION_MIN_MAX,
  PICK_CARDS,
  TOGGLE_APPLY_RECOMMENDED_RULES
} from '../actions';

export * from './helpers';

const selectedExpansionsReducer = selectAll => (map, [set, props]) => ({
  ...map,
  [set]: Object.assign({ min: 0, max: MAX_KINGDOM_CARDS }, props, { selected: selectAll })
});

const enhanceCards = cards => {
  const newCards = {};
  for (let [name, card] of Object.entries(cards)) {
    newCards[name] = { ...card, selected: true };
  }
  return newCards;
};

export const expansionsInitState = {
  drawerOpen: false,
  items: Object.entries(getExpansions())
    .map(([set, cards]) => [set, { cards: enhanceCards(cards) }])
    .reduce(selectedExpansionsReducer(true), {})
};

const expansions = (state = expansionsInitState, action) => {
  switch (action.type) {
    case TOGGLE_EXPANSION: {
      const name = action.payload;
      const newItem = { ...state.items[name], selected: !state.items[name].selected };
      const newItems = { ...state.items, [name]: newItem };
      return { ...state, items: newItems };
    }
    case TOGGLE_ALL_EXPANSIONS: {
      const selectAll = action.payload;
      const newItems = Object.entries(state.items).reduce(selectedExpansionsReducer(selectAll), {});
      return { ...state, items: newItems };
    }
    case TOGGLE_EXPANSION_DRAWER:
      return { ...state, drawerOpen: !state.drawerOpen };
    case TOGGLE_CARD: {
      const { set, name } = action.payload;
      const currentCard = state.items[set].cards[name];
      const newCard = { ...currentCard, selected: !currentCard.selected };
      const newCards = { ...state.items[set].cards, [name]: newCard };
      const newItem = { ...state.items[set], cards: newCards };
      const newItems = { ...state.items, [set]: newItem };
      return { ...state, items: newItems };
    }
    case SET_EXPANSION_MIN_MAX: {
      const { name, cards, min, max } = action.payload;
      const newItem = { ...state.items[name], min, max, cards };
      const newItems = { ...state.items, [name]: newItem };
      return { ...state, items: newItems };
    }
    case PICK_CARDS:
      return { ...state, drawerOpen: false };
    default:
      return state;
  }
};

const pickedCards = (state = {}, action) => {
  switch (action.type) {
    case PICK_CARDS:
      return action.payload;
    default:
      return state;
  }
};

const otherRules = (state = { applyRecommendedRules: true }, action) => {
  switch (action.type) {
    case TOGGLE_APPLY_RECOMMENDED_RULES:
      return { ...state, applyRecommendedRules: !state.applyRecommendedRules };
    default:
      return state;
  }
};

const rootReducer = combineReducers({
  expansions,
  pickedCards,
  otherRules
});

export default rootReducer;
