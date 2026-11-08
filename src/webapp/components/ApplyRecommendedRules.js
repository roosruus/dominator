import { useDispatch, useSelector } from 'react-redux';
import { FormControlLabel, FormGroup, Switch } from '@mui/material';

import { toggleApplyRecommendedRules } from '../store/otherRulesSlice';
import { selectIsApplyRecommendedRules } from '../store/selectors';

export default function ApplyRecommendedRules() {
  const dispatch = useDispatch();
  const checked = useSelector(selectIsApplyRecommendedRules);

  return (
    <FormGroup>
      <FormControlLabel
        control={<Switch checked={checked} onChange={() => dispatch(toggleApplyRecommendedRules())} />}
        label="Apply recommended rules"
      />
    </FormGroup>
  );
}
