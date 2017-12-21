import { combineReducers } from 'redux';

import { getExpansions } from './engine';
import { GROUP_TYPE_SET } from './engine/rules/factory';
import { MAX_KINGDOM_CARDS } from './engine/rules';
import {
  TOGGLE_EXPANSION,
  TOGGLE_ALL_EXPANSIONS,
  TOGGLE_EXPANSION_DRAWER,
  SET_EXPANSION_MIN_MAX,
  PICK_CARDS
} from './actions';

const selectedExpansionsReducer = selectAll => (map, [set, props]) => ({
  ...map,
  [set]: Object.assign({ min: 0, max: MAX_KINGDOM_CARDS }, props, { selected: selectAll })
});

export const expansionsInitState = {
  drawerOpen: false,
  items: getExpansions()
    .map(expansion => [expansion])
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
    case SET_EXPANSION_MIN_MAX: {
      const { name, min, max } = action.payload;
      const newItem = { ...state.items[name], min, max };
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

const rootReducer = combineReducers({
  expansions,
  pickedCards
});

export const getExpansionList = state =>
  Object.entries(state.expansions.items).map(([expansion, props]) => ({ name: expansion, ...props }));

const getSelectedExpansions = state =>
  Object.entries(state.expansions.items)
    .filter(([, props]) => props.selected)
    .map(([expansion]) => expansion);

const numAllExpansions = getExpansions().length;
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
      specificCards: []
    }
  }
});

export default rootReducer;
