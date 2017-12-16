import { combineReducers } from 'redux';

import { getExpansions } from './engine';
import { SELECT_EXPANSION, PICK_CARDS } from './actions';

const expansionsInitState = getExpansions().reduce((map, set) => ({ ...map, [set]: false }), {});
const expansions = (state = expansionsInitState, action) => {
  switch (action.type) {
    case SELECT_EXPANSION: {
      const { name, selected } = action.payload;
      return { ...state, [name]: selected };
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
    .map(([expansion]) => ({ name: expansion, type: 'set' }));

export const getCurrentRules = state => ({
  numKingdomCards: 10,
  filters: {
    include: {
      groups: getSelectedExpansions(state),
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
