import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import Switch from '@material-ui/core/Switch';

import { toggleApplyRecommendedRules } from '../actions';
import { isApplyRecommendedRules } from '../reducers';

class ApplyRecommendedRules extends PureComponent {
  constructor(props) {
    super(props);

    this.handleOnChange = this.handleOnChange.bind(this);
  }
  
  handleOnChange() {
    const { dispatch } = this.props;
    dispatch(toggleApplyRecommendedRules());
  }

  render() {
    return (
      <FormGroup>
        <FormControlLabel
          control={<Switch checked={this.props.checked} onChange={this.handleOnChange} />}
          label="Apply recommended rules"
        />
      </FormGroup>
    );
  }
}

const mapStateToProps = state => ({
  checked: isApplyRecommendedRules(state)
});

export default connect(mapStateToProps)(ApplyRecommendedRules);
