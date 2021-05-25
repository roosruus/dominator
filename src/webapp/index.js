import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';

import App from './components/App';
import rootReducer, { expansionsInitState } from './reducers';
import { observeStore } from './utils';
import { persistCardSelections, persistRuleSelections, mergePersistedSelections } from './persistence';

import './style.css';

const initialState = mergePersistedSelections(expansionsInitState);
const store = createStore(rootReducer, initialState);
observeStore(store, state => state.expansions.items, persistCardSelections);
observeStore(store, state => state.otherRules, persistRuleSelections);

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('app')
);
