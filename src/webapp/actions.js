import { createAction } from 'redux-actions';

export const TOGGLE_EXPANSION = 'TOGGLE_EXPANSION';
export const toggleExpansion = createAction(TOGGLE_EXPANSION);

export const TOGGLE_ALL_EXPANSIONS = 'TOGGLE_ALL_EXPANSIONS';
export const toggleAllExpansions = createAction(TOGGLE_ALL_EXPANSIONS);

export const PICK_CARDS = 'PICK_CARDS';
export const pickCards = createAction(PICK_CARDS);
