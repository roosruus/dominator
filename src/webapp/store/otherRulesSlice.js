import { createSlice } from '@reduxjs/toolkit';

export const otherRulesInitialState = {
  applyRecommendedRules: true
};

const otherRulesSlice = createSlice({
  name: 'otherRules',
  initialState: otherRulesInitialState,
  reducers: {
    toggleApplyRecommendedRules(state) {
      state.applyRecommendedRules = !state.applyRecommendedRules;
    }
  }
});

export const { toggleApplyRecommendedRules } = otherRulesSlice.actions;

export default otherRulesSlice.reducer;
