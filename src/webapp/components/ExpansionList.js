import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';
import Collapse from '@material-ui/core/Collapse';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';

import Expansion from './Expansion';
import { toggleExpansion, toggleAllExpansions, toggleExpansionDrawer, setExpansionMinMax } from '../actions';
import {
  getExpansionList,
  getSelectedExpansionsText,
  areAllExpansionsSelected,
  isNoExpansionsSelected,
  isExpansionDrawerOpen
} from '../reducers';

const styles = {
  noLeftPadding: {
    paddingLeft: 0
  }
};

class ExpansionList extends PureComponent {
  constructor(props) {
    super(props);

    this.handleExpansionSelected = this.handleExpansionSelected.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleCheck = this.handleCheck.bind(this);
    this.handleMinMaxChange = this.handleMinMaxChange.bind(this);
  }

  handleExpansionSelected(name) {
    const { dispatch } = this.props;
    dispatch(toggleExpansion(name));
  }

  handleClick() {
    const { dispatch } = this.props;
    dispatch(toggleExpansionDrawer());
  }

  handleCheck() {
    const { dispatch, areAllExpansionsSelected } = this.props;
    dispatch(toggleAllExpansions(!areAllExpansionsSelected));
  }

  handleMinMaxChange(payload) {
    const { dispatch } = this.props;
    if (!isNaN(payload.min) && !isNaN(payload.max)) {
      dispatch(setExpansionMinMax(payload));
    }
  }

  render() {
    const { classes } = this.props;
    return (
      <List>
        <ListItem button className={this.props.open ? classes.noLeftPadding : ''}>
          {this.props.open && (
            <Checkbox
              checked={this.props.areAllExpansionsSelected}
              indeterminate={!(this.props.areAllExpansionsSelected || this.props.isNoExpansionsSelected)}
              onChange={this.handleCheck}
            />
          )}
          <ListItemText
            primary="Expansions"
            onClick={this.handleClick}
            secondary={!this.props.open ? this.props.selectedExpansions : ''}
          />
          {this.props.open ? <ExpandLess onClick={this.handleClick} /> : <ExpandMore onClick={this.handleClick} />}
        </ListItem>
        <Collapse component="li" in={this.props.open} timeout="auto" unmountOnExit>
          <List disablePadding>
            {this.props.expansions.map((expansion, i) => (
              <Expansion
                name={expansion.name}
                selected={expansion.selected}
                min={expansion.min}
                max={expansion.max}
                onSelected={this.handleExpansionSelected}
                onMinMaxChange={this.handleMinMaxChange}
                key={`exp_${i}`}
              />
            ))}
          </List>
        </Collapse>
      </List>
    );
  }
}

const mapStateToProps = state => ({
  expansions: getExpansionList(state),
  selectedExpansions: getSelectedExpansionsText(state),
  areAllExpansionsSelected: areAllExpansionsSelected(state),
  isNoExpansionsSelected: isNoExpansionsSelected(state),
  open: isExpansionDrawerOpen(state)
});

export default connect(mapStateToProps)(withStyles(styles)(ExpansionList));
