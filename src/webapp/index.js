import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

import App from './components/App';
import rootReducer, { expansionsInitState } from './reducers';
import { observeStore } from './utils';
import { persistSelections, getPersistedSelections } from './persistence';

import './style.css';

const initialState = {};
const persistedSelections = getPersistedSelections();
if (persistedSelections) {
  initialState.expansions = {
    ...expansionsInitState,
    items: persistedSelections
  };
}

const store = createStore(rootReducer, initialState);
observeStore(store, state => state.expansions.items, persistSelections);

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('app')
);
