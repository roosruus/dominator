import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Select from '@material-ui/core/Select';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/Input';
import Typography from '@material-ui/core/Typography';

import CardTable from './CardTable';
import { MAX_KINGDOM_CARDS, RULES_KINGDOM_CARDS } from '../engine/rules';
import { createGetCardsInExpansion } from '../reducers';

const styles = {
  sections: {
    marginBottom: '20px'
  }
};

class ExpansionMinMax extends PureComponent {
  constructor(props) {
    super(props);
    this.state = this.getInitialState();

    this.handleEnter = this.handleEnter.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSelectCard = this.handleSelectCard.bind(this);
    this.handleSelectAll = this.handleSelectAll.bind(this);
  }

  getInitialState() {
    const cardsCopy = {};
    const kingdomCards = RULES_KINGDOM_CARDS.filterCards(
      Object.values(this.props.getCardsInExpansion(this.props.title))
    );
    for (let card of kingdomCards) {
      cardsCopy[card.name] = { ...card };
    }
    return {
      cards: cardsCopy,
      min: this.props.min,
      max: this.props.max
    };
  }

  handleEnter() {
    this.setState(this.getInitialState());
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

  handleSelectAll(e, selected) {
    const newCards = Object.entries(this.state.cards)
      .map(([, card]) => ({ ...card, selected }))
      .reduce((obj, card) => ({ ...obj, [card.name]: card }), {});

    this.setState({
      cards: newCards
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
              onSelectAll={this.handleSelectAll}
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
