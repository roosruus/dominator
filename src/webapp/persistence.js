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
