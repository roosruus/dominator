import React from 'react';
import List, { ListItem, ListItemText } from 'material-ui/List';
import Collapse from 'material-ui/transitions/Collapse';
import ExpandLess from 'material-ui-icons/ExpandLess';
import ExpandMore from 'material-ui-icons/ExpandMore';
import { connect } from 'react-redux';

import Expansion from './Expansion';
import { toggleExpansion } from '../actions';
import { getExpansionList, getSelectedExpansionsText } from '../reducers';

class ExpansionList extends React.Component {
  constructor(props) {
    super(props);
    this.state = { open: false };
    this.handleExpansionSelected = this.handleExpansionSelected.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  handleExpansionSelected(name) {
    const { dispatch } = this.props;
    dispatch(toggleExpansion(name));
  }

  handleClick() {
    this.setState({ open: !this.state.open });
  }

  render() {
    return (
      <List>
        <ListItem button onClick={this.handleClick}>
          <ListItemText primary="Expansions" secondary={this.props.selectedExpansions}/>
          {this.state.open ? <ExpandLess /> : <ExpandMore />}
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
  selectedExpansions: getSelectedExpansionsText(state)
});

export default connect(mapStateToProps)(ExpansionList);
