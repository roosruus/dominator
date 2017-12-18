import { createAction } from 'redux-actions';

export const TOGGLE_EXPANSION = 'TOGGLE_EXPANSION';
export const toggleExpansion = createAction(TOGGLE_EXPANSION);

export const PICK_CARDS = 'PICK_CARDS';
export const pickCards = createAction(PICK_CARDS);
