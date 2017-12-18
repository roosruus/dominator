import React from 'react';
import Dialog, { DialogTitle, DialogContent, DialogActions } from 'material-ui/Dialog';
import Select from 'material-ui/Select';
import Button from 'material-ui/Button';
import { FormControl } from 'material-ui/Form';
import Input, { InputLabel } from 'material-ui/Input';

class ExpansionMinMax extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      min: this.props.min,
      max: this.props.max
    };

    this.handleEnter = this.handleEnter.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  handleEnter() {
    this.setState({
      min: this.props.min,
      max: this.props.max
    });
  }

  handleChange(field) {
    return e => {
      this.setState({ [field]: e.target.value });
    };
  }

  render() {
    const minId = `${this.props.title}-min`,
      maxId = `${this.props.title}-max`;
    return (
      <Dialog open={this.props.open} onClose={() => this.props.onClose(false)} onEnter={this.handleEnter}>
        <DialogTitle id="simple-dialog-title">{this.props.title}</DialogTitle>
        <DialogContent>
          <FormControl>
            <InputLabel htmlFor={minId}>Min</InputLabel>
            <Select native value={this.state.min} input={<Input id={minId} />} onChange={this.handleChange('min')}>
              {Array.from(Array(11).keys()).map(num => (
                <option key={`${minId}-${num}`} value={num}>
                  {num}
                </option>
              ))}
            </Select>
          </FormControl>
          <FormControl>
            <InputLabel htmlFor={maxId}>Max</InputLabel>
            <Select native value={this.state.max} input={<Input id={maxId} />} onChange={this.handleChange('max')}>
              {Array.from(Array(11).keys()).map(num => (
                <option key={`${maxId}-${num}`} value={num}>
                  {num}
                </option>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.props.onClose} color="primary">
            Cancel
          </Button>
          <Button onClick={() => this.props.onClose(this.state)} color="primary">
            Ok
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default ExpansionMinMax;
