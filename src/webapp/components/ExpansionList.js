import React from 'react';
import { List, ListItem } from 'material-ui/List';
import { connect } from 'react-redux';

import Expansion from './Expansion';
import { selectExpansion } from '../actions';
import { getExpansionList } from '../reducers';

class ExpansionList extends React.Component {
  constructor(props) {
    super(props);
    this.handleExpansionSelected = this.handleExpansionSelected.bind(this);
  }

  handleExpansionSelected(name, selected) {
    const { dispatch } = this.props;
    dispatch(selectExpansion({ name, selected }));
  }

  render() {
    return (
      <List>
        <ListItem
          primaryText="Expansions"
          initiallyOpen={false}
          primaryTogglesNestedList={true}
          nestedItems={this.props.expansions.map((expansion, i) => (
            <Expansion
              name={expansion.name}
              selected={expansion.selected}
              onSelected={this.handleExpansionSelected}
              key={`exp_${i}`}
            />
          ))}
        />
      </List>
    );
  }
}

const mapStateToProps = state => ({ expansions: getExpansionList(state) });

export default connect(mapStateToProps)(ExpansionList);
