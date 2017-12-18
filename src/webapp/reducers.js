import { combineReducers } from 'redux';

import { getExpansions } from './engine';
import { TOGGLE_EXPANSION, TOGGLE_ALL_EXPANSIONS, PICK_CARDS } from './actions';


const selectedExpansionsReducer = selectAll => (map, set) => ({ ...map, [set]: selectAll});

const expansionsInitState = getExpansions().reduce(selectedExpansionsReducer(true), {});
const expansions = (state = expansionsInitState, action) => {
  switch (action.type) {
    case TOGGLE_EXPANSION: {
      const name = action.payload;
      return { ...state, [name]: !state[name] };
    }
    case TOGGLE_ALL_EXPANSIONS: {
      const selectAll = action.payload;
      return Object.keys(state).reduce(selectedExpansionsReducer(selectAll), {});
    }
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
  Object.entries(state.expansions).map(([expansion, selected]) => ({ name: expansion, selected }));

const getSelectedExpansions = state =>
  Object.entries(state.expansions)
    .filter(([, selected]) => selected)
    .map(([expansion]) => expansion);

const numAllExpansions = getExpansions().length;
export const areAllExpansionsSelected = state => getSelectedExpansions(state).length === numAllExpansions;
export const isNoExpansionsSelected = state => getSelectedExpansions(state).length  === 0;

export const getSelectedExpansionsText = state => {
  let text;
  const selectedExpansions = getSelectedExpansions(state);
  if(selectedExpansions.length === numAllExpansions) {
    text = 'All';
  }
  else {
    text = selectedExpansions.join(', ');
  }
  return text;
};

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
