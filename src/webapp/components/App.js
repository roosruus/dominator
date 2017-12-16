import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles } from 'material-ui/styles';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';
import Card, { CardContent } from 'material-ui/Card';

import ExpansionList from './ExpansionList';
import ResultsTable from './ResultsTable';
import { pickCards } from '../actions';
import { getCurrentRules } from '../reducers';
import { createGameSetup } from '../engine';


const styles = {
  flex: {
    flex: 1
  }
};


class App extends Component {
  constructor(props) {
    super(props);
    this.handleTouchTap = this.handleTouchTap.bind(this);
  }

  handleTouchTap() {
    const { dispatch, currentRules } = this.props;
    const pickedCards = createGameSetup(currentRules).pickCards();
    dispatch(pickCards(pickedCards));
  }

  render() {
    const { classes } = this.props;
    return (
      <div>
        <AppBar position="static">
          <Toolbar>
            <Typography type="title" color="inherit" className={classes.flex}>
              Shuffle My Kingdom
            </Typography>
            <Button color="contrast" onTouchTap={this.handleTouchTap}>
              Shuffle
            </Button>
          </Toolbar>
        </AppBar>
        <Card>
          <CardContent>
            <ExpansionList />
          </CardContent>
        </Card>
        {this.props.pickedCards.length > 0 && (
          <Card>
            <ResultsTable pickedCards={this.props.pickedCards}/>
          </Card>
        )}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  pickedCards: state.pickedCards,
  currentRules: getCurrentRules(state)
});

export default connect(mapStateToProps)(withStyles(styles)(App));
