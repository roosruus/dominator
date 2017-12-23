export const persistSelections = selections => {
  localStorage.setItem('selections', JSON.stringify(selections));
};

export const getPersistedSelections = () => {
  let selections;
  const persistedValue = localStorage.getItem('selections');
  if (persistedValue) {
    selections = JSON.parse(persistedValue);
  }
  return selections;
};

export const mergePersistedSelections = (expansionsInitState) => {
  const initialState = {};
  
  const persistedSelections = getPersistedSelections();
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
  return initialState;
};
