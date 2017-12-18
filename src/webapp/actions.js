import { createAction } from 'redux-actions';

export const TOGGLE_EXPANSION = 'TOGGLE_EXPANSION';
export const TOGGLE_ALL_EXPANSIONS = 'TOGGLE_ALL_EXPANSIONS';
export const TOGGLE_EXPANSION_DRAWER = 'TOGGLE_EXPANSION_DRAWER';
export const PICK_CARDS = 'PICK_CARDS';
export const SET_EXPANSION_MIN_MAX = 'SET_EXPANSION_MIN_MAX';
export const toggleExpansion = createAction(TOGGLE_EXPANSION);
export const toggleAllExpansions = createAction(TOGGLE_ALL_EXPANSIONS);
export const toggleExpansionDrawer = createAction(TOGGLE_EXPANSION_DRAWER);
export const setExpansionMinMax = createAction(SET_EXPANSION_MIN_MAX);
export const pickCards = createAction(PICK_CARDS);
