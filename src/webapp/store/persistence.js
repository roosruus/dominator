import { MAX_KINGDOM_CARDS } from '../engine/rules';
import { selectSettings } from './selectors';

const SETTINGS_KEY = 'settings';
const SETTINGS_VERSION = 2;
// Version 1 stored whole card objects per expansion, which kept stale card data around after updates.
const LEGACY_SELECTIONS_KEY = 'selections';
const LEGACY_RULES_KEY = 'rules';

const read = key => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : undefined;
  } catch {
    return undefined;
  }
};

const isObject = value => typeof value === 'object' && value !== null;

const migrateLegacySettings = (selections, rules) => {
  const expansions = {};
  for (const [name, item] of Object.entries(isObject(selections) ? selections : {})) {
    if (isObject(item)) {
      const cards = isObject(item.cards) ? Object.values(item.cards) : [];
      expansions[name] = {
        selected: item.selected,
        min: item.min,
        max: item.max,
        excludedCards: cards.filter(card => card?.selected === false).map(card => card.name)
      };
    }
  }
  return { expansions, applyRecommendedRules: rules?.applyRecommendedRules };
};

const loadSettings = () => {
  const settings = read(SETTINGS_KEY);
  if (settings?.version === SETTINGS_VERSION) {
    return settings;
  }
  const legacySelections = read(LEGACY_SELECTIONS_KEY);
  const legacyRules = read(LEGACY_RULES_KEY);
  if (legacySelections !== undefined || legacyRules !== undefined) {
    return migrateLegacySettings(legacySelections, legacyRules);
  }
  return undefined;
};

const isLimit = value => Number.isInteger(value) && value >= 0 && value <= MAX_KINGDOM_CARDS;

const restoreExpansion = (defaults, saved) => {
  if (!isObject(saved)) {
    return defaults;
  }
  return {
    selected: typeof saved.selected === 'boolean' ? saved.selected : defaults.selected,
    min: isLimit(saved.min) ? saved.min : defaults.min,
    max: isLimit(saved.max) ? saved.max : defaults.max,
    excludedCards: Array.isArray(saved.excludedCards)
      ? saved.excludedCards.filter(name => typeof name === 'string')
      : defaults.excludedCards
  };
};

export const loadPersistedState = (expansionsInitialState, otherRulesInitialState) => {
  const settings = loadSettings();
  if (!isObject(settings)) {
    return {};
  }

  const savedExpansions = isObject(settings.expansions) ? settings.expansions : {};
  const items = {};
  for (const [name, defaults] of Object.entries(expansionsInitialState.items)) {
    items[name] = restoreExpansion(defaults, savedExpansions[name]);
  }

  const { applyRecommendedRules } = settings;
  return {
    expansions: { ...expansionsInitialState, items },
    otherRules: {
      ...otherRulesInitialState,
      ...(typeof applyRecommendedRules === 'boolean' && { applyRecommendedRules })
    }
  };
};

const saveSettings = settings => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ version: SETTINGS_VERSION, ...settings }));
    localStorage.removeItem(LEGACY_SELECTIONS_KEY);
    localStorage.removeItem(LEGACY_RULES_KEY);
  } catch {
    // Storage unavailable or full; settings just won't persist.
  }
};

export const persistSelections = store => {
  let current;
  const handleChange = () => {
    const next = selectSettings(store.getState());
    if (next !== current) {
      current = next;
      saveSettings(current);
    }
  };
  handleChange();
  return store.subscribe(handleChange);
};
