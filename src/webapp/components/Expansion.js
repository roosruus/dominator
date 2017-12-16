import React from 'react';
import { ListItem, ListItemText } from 'material-ui/List';
import Checkbox from 'material-ui/Checkbox';

export default class Expansion extends React.Component {
  constructor(props) {
    super(props);
    this.handleCheck = this.handleCheck.bind(this);
  }

  handleCheck(e, value) {
    this.props.onSelected(this.props.name, value);
  }

  render() {
    return (
      <ListItem>
        <Checkbox checked={this.props.selected} onChange={this.handleCheck}/>
        <ListItemText primary={this.props.name} />
      </ListItem>
    );
  }
}
