import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Dialog, { DialogTitle, DialogContent, DialogActions } from 'material-ui/Dialog';
import Select from 'material-ui/Select';
import Button from 'material-ui/Button';
import { FormControl } from 'material-ui/Form';
import Input, { InputLabel } from 'material-ui/Input';
import Typography from 'material-ui/Typography';

import CardTable from './CardTable';
import { MAX_KINGDOM_CARDS } from '../engine/rules';
import { createGetCardsInExpansion } from '../reducers';

const styles = {
  sections: {
    marginBottom: '20px'
  }
};

class ExpansionMinMax extends React.PureComponent {
  constructor(props) {
    super(props);
    const cardsCopy = {};
    for (let [name, card] of Object.entries(props.getCardsInExpansion(props.title))) {
      cardsCopy[name] = { ...card };
    }
    this.state = {
      cards: cardsCopy,
      min: this.props.min,
      max: this.props.max
    };

    this.handleEnter = this.handleEnter.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSelectCard = this.handleSelectCard.bind(this);
  }

  handleEnter() {
    this.setState({
      min: this.props.min,
      max: this.props.max
    });
  }

  handleChange(field) {
    return e => {
      this.setState({ [field]: e.target.value ? parseInt(e.target.value) : undefined });
    };
  }

  handleSelectCard(card) {
    this.setState({
      cards: { ...this.state.cards, [card.name]: { ...card, selected: !card.selected } }
    });
  }

  render() {
    const { classes, title, open, onClose } = this.props;
    const minId = `${title}-min`,
      maxId = `${title}-max`;
    return (
      <Dialog open={open} onClose={() => onClose(false)} onEnter={this.handleEnter}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <div className={classes.sections}>
            <Typography type="subheading">Limits</Typography>
            <FormControl component="fieldset">
              <InputLabel htmlFor={minId}>Min</InputLabel>
              <Select native value={this.state.min} input={<Input id={minId} />} onChange={this.handleChange('min')}>
                {Array.from(Array(11).keys()).map(num => (
                  <option key={`${minId}-${num}`} value={num}>
                    {num}
                  </option>
                ))}
              </Select>
            </FormControl>
            <FormControl component="fieldset">
              <InputLabel htmlFor={maxId}>Max</InputLabel>
              <Select native value={this.state.max} input={<Input id={maxId} />} onChange={this.handleChange('max')}>
                {Array.from(Array(11).keys()).map(num => (
                  <option key={`${maxId}-${num}`} value={num}>
                    {num}
                  </option>
                ))}
              </Select>
            </FormControl>
          </div>
          <div>
            <Typography type="subheading">Individual cards</Typography>
            <CardTable
              cards={Object.values(this.state.cards)}
              displayColumns={['name', 'cost']}
              onSelectCard={this.handleSelectCard}
              selectableRows={true}
              sortableHeader={false}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary">
            Cancel
          </Button>
          <Button onClick={() => onClose(this.state)} color="primary">
            Ok
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

ExpansionMinMax.propTypes = {
  min: PropTypes.number,
  max: PropTypes.number,
  onClose: PropTypes.func,
  open: PropTypes.bool,
  title: PropTypes.string
};

ExpansionMinMax.defaultProps = {
  min: 0,
  max: MAX_KINGDOM_CARDS
};

const mapStateToProps = state => ({
  getCardsInExpansion: createGetCardsInExpansion(state)
});

export default connect(mapStateToProps)(withStyles(styles)(ExpansionMinMax));
