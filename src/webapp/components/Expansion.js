import React from 'react';
import PropTypes from 'prop-types';
import { ListItem, ListItemText, ListItemSecondaryAction } from 'material-ui/List';
import Checkbox from 'material-ui/Checkbox';
import IconButton from 'material-ui/IconButton';
import MoreVert from 'material-ui-icons/MoreVert';

import ExpansionMinMax from './ExpansionMinMax';
import { MAX_KINGDOM_CARDS } from '../engine/rules';

export default class Expansion extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = { open: false, anchorEl: null };

    this.handleCheck = this.handleCheck.bind(this);
    this.handleMore = this.handleMore.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  handleCheck() {
    this.props.onSelected(this.props.name);
  }

  handleMore() {
    this.setState({ open: true });
  }

  handleClose(payload) {
    this.setState({ open: false });
    this.props.onMinMaxChange({ name: this.props.name, ...payload });
  }

  render() {
    const {min, max} = this.props;
    
    let secondaryText = '';
    if(min !== 0 || max !== MAX_KINGDOM_CARDS) {
      secondaryText = `Min: ${min}, Max: ${max}`;
    }
    
    return (
      <div>
        <ListItem dense button onTouchTap={this.handleCheck} className="expansion-list-item">
          <Checkbox checked={this.props.selected} disableRipple />
          <ListItemText primary={this.props.name} secondary={secondaryText} />
          <ListItemSecondaryAction>
            <IconButton>
              <MoreVert onTouchTap={this.handleMore} />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
        <ExpansionMinMax
          title={this.props.name}
          open={this.state.open}
          onClose={this.handleClose}
          min={min}
          max={max}
        />
      </div>
    );
  }
}

Expansion.propTypes = {
  min: PropTypes.number,
  max: PropTypes.number,
  name: PropTypes.string,
  onMinMaxChange: PropTypes.func,
  onSelected: PropTypes.func,
  selected: PropTypes.bool
};

Expansion.defaultProps = {
  min: 0,
  max: MAX_KINGDOM_CARDS
};
