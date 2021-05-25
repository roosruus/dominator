import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';

import ExpansionList from './ExpansionList';
import ApplyRecommendedRules from './ApplyRecommendedRules';
import CardTable from './CardTable';
import { pickCards } from '../actions';
import { getCurrentRules } from '../reducers';
import { createGameSetup } from '../engine';

const styles = theme => ({
  results: theme.mixins.gutters({
    paddingTop: 16,
    paddingBottom: 16,
    marginTop: theme.spacing.unit * 3
  }),
  flex: {
    flex: 1
  }
});

class App extends Component {
  constructor(props) {
    super(props);
    this.handleTouchTap = this.handleTouchTap.bind(this);
  }

  handleTouchTap() {
    const { dispatch, currentRules } = this.props;
    const gameSetup = createGameSetup(currentRules);
    const kingdomCards = gameSetup.pickCards();
    const additionalCards = gameSetup.getAdditionalCards();
    dispatch(pickCards({ kingdomCards, additionalCards }));
  }

  render() {
    const { classes, pickedCards } = this.props;
    return (
      <div>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" className={classes.flex}>
              Shuffle My Kingdom
            </Typography>
            <Button color="inherit" onClick={this.handleTouchTap}>
              Shuffle
            </Button>
          </Toolbar>
        </AppBar>
        <Card>
          <CardContent>
            <ExpansionList />
            <ApplyRecommendedRules />
          </CardContent>
        </Card>
        {pickedCards.kingdomCards && (
          <Card className={classes.results}>
            <Typography type="title">Kingdom cards</Typography>
            <CardTable cards={pickedCards.kingdomCards} />
            {pickedCards.additionalCards &&
              pickedCards.additionalCards.length > 0 && (
              <div>
                <Typography type="title">Additional cards</Typography>
                <CardTable cards={pickedCards.additionalCards} />
              </div>
            )}
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
