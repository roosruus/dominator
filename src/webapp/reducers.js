import { combineReducers } from 'redux';

import { getExpansions } from './engine';
import { TOGGLE_EXPANSION, TOGGLE_ALL_EXPANSIONS, TOGGLE_EXPANSION_DRAWER, PICK_CARDS } from './actions';


const selectedExpansionsReducer = selectAll => (map, set) => ({ ...map, [set]: selectAll });

const expansionsInitState = {
  drawerOpen: false,
  items: getExpansions().reduce(selectedExpansionsReducer(true), {})
};
const expansions = (state = expansionsInitState, action) => {
  switch (action.type) {
    case TOGGLE_EXPANSION: {
      const name = action.payload;
      const newItems = { ...state.items, [name]: !state.items[name] };
      return { ...state, items: newItems };
    }
    case TOGGLE_ALL_EXPANSIONS: {
      const selectAll = action.payload;
      const newItems = Object.keys(state.items).reduce(selectedExpansionsReducer(selectAll), {});
      return { ...state, items: newItems };
    }
    case TOGGLE_EXPANSION_DRAWER:
      return { ...state, drawerOpen: !state.drawerOpen };
    case PICK_CARDS:
      return { ...state, drawerOpen: false };
    default:
      return state;
  }
};

const pickedCards = (state = [], action) => {
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
  Object.entries(state.expansions.items).map(([expansion, selected]) => ({ name: expansion, selected }));

const getSelectedExpansions = state =>
  Object.entries(state.expansions.items)
    .filter(([, selected]) => selected)
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

export const getCurrentRules = state => ({
  numKingdomCards: 10,
  filters: {
    include: {
      groups: getSelectedExpansions(state).map(expansion => ({ name: expansion, type: 'set' })),
      limits: [],
      specificCards: []
    },
    exclude: {
      groups: [],
      specificCards: []
    }
  }
});


export default rootReducer;
