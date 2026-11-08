import { useDispatch, useSelector } from 'react-redux';
import { Checkbox, Collapse, List, ListItemButton, ListItemText } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';

import Expansion from './Expansion';
import { toggleAllExpansions, toggleExpansionDrawer } from '../store/expansionsSlice';
import {
  selectAreAllExpansionsSelected,
  selectExpansionList,
  selectIsExpansionDrawerOpen,
  selectIsNoExpansionsSelected,
  selectSelectedExpansionsText
} from '../store/selectors';

export default function ExpansionList() {
  const dispatch = useDispatch();
  const expansions = useSelector(selectExpansionList);
  const selectedExpansionsText = useSelector(selectSelectedExpansionsText);
  const allSelected = useSelector(selectAreAllExpansionsSelected);
  const noneSelected = useSelector(selectIsNoExpansionsSelected);
  const open = useSelector(selectIsExpansionDrawerOpen);

  return (
    <List>
      <ListItemButton onClick={() => dispatch(toggleExpansionDrawer())} sx={open ? { pl: 0 } : undefined}>
        {open && (
          <Checkbox
            checked={allSelected}
            indeterminate={!allSelected && !noneSelected}
            onChange={() => dispatch(toggleAllExpansions(!allSelected))}
            onClick={e => e.stopPropagation()}
            slotProps={{ input: { 'aria-label': 'Select all expansions' } }}
          />
        )}
        <ListItemText primary="Expansions" secondary={open ? '' : selectedExpansionsText} />
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse component="li" in={open} timeout="auto" unmountOnExit>
        <List disablePadding>
          {expansions.map(({ name, selected, min, max, excludedCards }) => (
            <Expansion
              key={name}
              name={name}
              selected={selected}
              min={min}
              max={max}
              excludedCards={excludedCards}
            />
          ))}
        </List>
      </Collapse>
    </List>
  );
}
