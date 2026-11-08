import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Checkbox, IconButton, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { MoreVert } from '@mui/icons-material';

import ExpansionMinMax from './ExpansionMinMax';
import { MAX_KINGDOM_CARDS } from '../engine/rules';
import { setExpansionLimits, toggleExpansion } from '../store/expansionsSlice';

export default function Expansion({ name, selected, min = 0, max = MAX_KINGDOM_CARDS }) {
  const dispatch = useDispatch();
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDialogClose = limits => {
    setDialogOpen(false);
    if (limits) {
      dispatch(setExpansionLimits({ name, ...limits }));
    }
  };

  const hasCustomLimits = min !== 0 || max !== MAX_KINGDOM_CARDS;

  return (
    <>
      <ListItem
        disablePadding
        secondaryAction={
          <IconButton edge="end" aria-label={`${name} settings`} onClick={() => setDialogOpen(true)}>
            <MoreVert />
          </IconButton>
        }
      >
        <ListItemButton dense onClick={() => dispatch(toggleExpansion(name))} sx={{ pl: 0 }}>
          <ListItemIcon>
            <Checkbox checked={selected} tabIndex={-1} disableRipple slotProps={{ input: { 'aria-label': name } }} />
          </ListItemIcon>
          <ListItemText primary={name} secondary={hasCustomLimits ? `Min: ${min}, Max: ${max}` : ''} />
        </ListItemButton>
      </ListItem>
      <ExpansionMinMax title={name} open={dialogOpen} onClose={handleDialogClose} min={min} max={max} />
    </>
  );
}
