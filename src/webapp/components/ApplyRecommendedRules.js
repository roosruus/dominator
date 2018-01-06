import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { FormControlLabel, FormGroup } from 'material-ui/Form';
import Switch from 'material-ui/Switch';

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
