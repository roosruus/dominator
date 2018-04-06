export const persistCardSelections = selections => {
  localStorage.setItem('selections', JSON.stringify(selections));
};

export const persistRuleSelections = rules => {
  localStorage.setItem('rules', JSON.stringify(rules));
};

const getPersistedCardSelections = () => {
  let selections;
  const persistedValue = localStorage.getItem('selections');
  if (persistedValue) {
    selections = JSON.parse(persistedValue);
  }
  return selections;
};

const getPersistedRuleSelections = () => {
  let selections;
  const persistedValue = localStorage.getItem('rules');
  if (persistedValue) {
    selections = JSON.parse(persistedValue);
  }
  return selections;
};

export const mergePersistedSelections = (expansionsInitState, rulesInitState) => {
  const initialState = {};
  
  const persistedSelections = getPersistedCardSelections();
  if (persistedSelections) {
    const newItems = {};
    for(let [expansion, props] of Object.entries(expansionsInitState.items)) {
      const persistedItem = persistedSelections[expansion];
      const newItem = {};
      for(let [key, value] in Object.entries(props)) {
        if(persistedItem && persistedItem[key] && typeof(persistedItem[key]) == typeof(value)) {
          newItem[key] = persistedItem[key];
        }
        else {
          newItem[key] = value;
        }
      }
      newItems[expansion] = { ...props, ...persistedSelections[expansion] };
    }
    
    initialState.expansions = {
      ...expansionsInitState,
      items: newItems
    };
  }
  
  const persistedRuleSelections = getPersistedRuleSelections();
  if (persistedRuleSelections) {
    initialState.otherRules = {
      ...rulesInitState,
      ...persistedRuleSelections
    };
  }
  
  return initialState;
};
