import React from 'react';
import List, { ListItem, ListItemText } from 'material-ui/List';
import Checkbox from 'material-ui/Checkbox';
import Collapse from 'material-ui/transitions/Collapse';
import ExpandLess from 'material-ui-icons/ExpandLess';
import ExpandMore from 'material-ui-icons/ExpandMore';
import { connect } from 'react-redux';

import Expansion from './Expansion';
import { toggleExpansion, toggleAllExpansions } from '../actions';
import {
  getExpansionList,
  getSelectedExpansionsText,
  areAllExpansionsSelected,
  isNoExpansionsSelected
} from '../reducers';

class ExpansionList extends React.Component {
  constructor(props) {
    super(props);
    this.state = { open: false };
    this.handleExpansionSelected = this.handleExpansionSelected.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleCheck = this.handleCheck.bind(this);
  }

  handleExpansionSelected(name) {
    const { dispatch } = this.props;
    dispatch(toggleExpansion(name));
  }

  handleClick() {
    this.setState({ open: !this.state.open });
  }

  handleCheck() {
    const { dispatch, areAllExpansionsSelected } = this.props;
    dispatch(toggleAllExpansions(!areAllExpansionsSelected));
  }

  render() {
    return (
      <List>
        <ListItem button className={this.state.open ? 'no-left-padding' : ''}>
          {this.state.open && (
            <Checkbox
              checked={this.props.areAllExpansionsSelected}
              indeterminate={!(this.props.areAllExpansionsSelected || this.props.isNoExpansionsSelected)}
              onChange={this.handleCheck}
            />
          )}
          <ListItemText primary="Expansions" onClick={this.handleClick} secondary={this.props.selectedExpansions} />
          {this.state.open ? <ExpandLess onClick={this.handleClick} /> : <ExpandMore onClick={this.handleClick} />}
        </ListItem>
        <Collapse component="li" in={this.state.open} timeout="auto" unmountOnExit>
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
  isNoExpansionsSelected: isNoExpansionsSelected(state)
});

export default connect(mapStateToProps)(ExpansionList);
