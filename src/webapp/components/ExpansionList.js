import React from 'react';
import List, { ListItem, ListItemText } from 'material-ui/List';
import Checkbox from 'material-ui/Checkbox';
import Collapse from 'material-ui/transitions/Collapse';
import ExpandLess from 'material-ui-icons/ExpandLess';
import ExpandMore from 'material-ui-icons/ExpandMore';
import { connect } from 'react-redux';

import Expansion from './Expansion';
import { toggleExpansion, toggleAllExpansions, toggleExpansionDrawer } from '../actions';
import {
  getExpansionList,
  getSelectedExpansionsText,
  areAllExpansionsSelected,
  isNoExpansionsSelected,
  isExpansionDrawerOpen
} from '../reducers';

class ExpansionList extends React.Component {
  constructor(props) {
    super(props);
    this.handleExpansionSelected = this.handleExpansionSelected.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleCheck = this.handleCheck.bind(this);
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

  render() {
    return (
      <List>
        <ListItem button className={this.props.open ? 'no-left-padding' : ''}>
          {this.props.open && (
            <Checkbox
              checked={this.props.areAllExpansionsSelected}
              indeterminate={!(this.props.areAllExpansionsSelected || this.props.isNoExpansionsSelected)}
              onChange={this.handleCheck}
            />
          )}
          <ListItemText primary="Expansions" onClick={this.handleClick} secondary={this.props.selectedExpansions} />
          {this.props.open ? <ExpandLess onClick={this.handleClick} /> : <ExpandMore onClick={this.handleClick} />}
        </ListItem>
        <Collapse component="li" in={this.props.open} timeout="auto" unmountOnExit>
          <List disablePadding>
            {this.props.expansions.map((expansion, i) => (
              <Expansion
                name={expansion.name}
                selected={expansion.selected}
                onSelected={this.handleExpansionSelected}
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

export default connect(mapStateToProps)(ExpansionList);
