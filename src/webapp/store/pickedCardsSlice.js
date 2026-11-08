import { createSlice } from '@reduxjs/toolkit';

import { createGameSetup } from '../engine';
import { selectCurrentRules } from './selectors';

const pickedCardsSlice = createSlice({
  name: 'pickedCards',
  initialState: {},
  reducers: {
    pickCards: (state, { payload }) => payload
  }
});

export const { pickCards } = pickedCardsSlice.actions;

export const shuffleKingdom = () => (dispatch, getState) => {
  const gameSetup = createGameSetup(selectCurrentRules(getState()));
  const kingdomCards = gameSetup.pickCards();
  const additionalCards = gameSetup.getAdditionalCards();
  dispatch(pickCards({ kingdomCards, additionalCards }));
};

export default pickedCardsSlice.reducer;
