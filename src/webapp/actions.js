import { createAction } from 'redux-actions';

export const SELECT_EXPANSION = 'SELECT_EXPANSION';
export const selectExpansion = createAction(SELECT_EXPANSION);

export const PICK_CARDS = 'PICK_CARDS';
export const pickCards = createAction(PICK_CARDS);
