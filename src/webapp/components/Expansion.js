import React from 'react';
import { ListItem, ListItemText } from 'material-ui/List';
import Checkbox from 'material-ui/Checkbox';

export default class Expansion extends React.PureComponent {
  constructor(props) {
    super(props);
    this.handleCheck = this.handleCheck.bind(this);
  }

  handleCheck() {
    this.props.onSelected(this.props.name);
  }

  render() {
    return (
      <ListItem dense button onClick={this.handleCheck} className="expansion-list-item">
        <Checkbox checked={this.props.selected} disableRipple/>
        <ListItemText primary={this.props.name} />
      </ListItem>
    );
  }
}
