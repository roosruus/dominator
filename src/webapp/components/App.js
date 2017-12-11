import React, { Component } from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import AppBar from 'material-ui/AppBar';

import ExpansionList from './ExpansionList';
class App extends Component {
  render() {
    return (
      <MuiThemeProvider>
        <div>
          <AppBar title="Shuffle My Kingdom" />
          <ExpansionList/>
        </div>
      </MuiThemeProvider>
    );
  }
}

export default App;
