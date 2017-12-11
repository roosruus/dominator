import { combineReducers } from 'redux';

import { getExpansions } from './engine';
import { SELECT_EXPANSION } from './actions';

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

const rootReducer = combineReducers({
  expansions
});

export const getExpansionList = state => {
  return Object.entries(state.expansions).map(([expansion, selected]) => ({ name: expansion, selected }));
};

export default rootReducer;
