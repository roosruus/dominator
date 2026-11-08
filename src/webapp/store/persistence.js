const SELECTIONS_KEY = 'selections';
const RULES_KEY = 'rules';

const load = key => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : undefined;
  } catch {
    return undefined;
  }
};

const save = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage unavailable or full; selections just won't persist.
  }
};

export const loadPersistedState = (expansionsInitialState, otherRulesInitialState) => {
  const state = {};

  const persistedSelections = load(SELECTIONS_KEY);
  if (persistedSelections) {
    const items = {};
    for (const [expansion, props] of Object.entries(expansionsInitialState.items)) {
      items[expansion] = { ...props, ...persistedSelections[expansion] };
    }
    state.expansions = { ...expansionsInitialState, items };
  }

  const persistedRules = load(RULES_KEY);
  if (persistedRules) {
    state.otherRules = { ...otherRulesInitialState, ...persistedRules };
  }

  return state;
};

const observeStore = (store, select, onChange) => {
  let current;
  const handleChange = () => {
    const next = select(store.getState());
    if (next !== current) {
      current = next;
      onChange(current);
    }
  };
  handleChange();
  return store.subscribe(handleChange);
};

export const persistSelections = store => {
  observeStore(store, state => state.expansions.items, items => save(SELECTIONS_KEY, items));
  observeStore(store, state => state.otherRules, rules => save(RULES_KEY, rules));
};
