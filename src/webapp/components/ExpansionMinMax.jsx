import { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography
} from '@mui/material';

import CardTable from './CardTable';
import { MAX_KINGDOM_CARDS, RULES_KINGDOM_CARDS } from '../engine/rules';
import { selectCardsInExpansion } from '../store/selectors';

const LIMIT_OPTIONS = Array.from({ length: MAX_KINGDOM_CARDS + 1 }, (_, i) => i);

function LimitSelect({ label, value, onChange }) {
  return (
    <TextField
      select
      variant="standard"
      label={label}
      value={value}
      onChange={e => onChange(Number(e.target.value))}
      slotProps={{ select: { native: true } }}
    >
      {LIMIT_OPTIONS.map(num => (
        <option key={num} value={num}>
          {num}
        </option>
      ))}
    </TextField>
  );
}

// Rendered only while the dialog is open, so its state starts fresh from the store each time.
function ExpansionMinMaxForm({ title, min, max, onClose }) {
  const cardsInExpansion = useSelector(state => selectCardsInExpansion(state, title));
  const [limits, setLimits] = useState({ min, max });
  const [cards, setCards] = useState(() =>
    Object.fromEntries(
      RULES_KINGDOM_CARDS.filterCards(Object.values(cardsInExpansion)).map(card => [card.name, card])
    )
  );

  const toggleCard = card => {
    setCards(current => ({ ...current, [card.name]: { ...card, selected: !card.selected } }));
  };

  const toggleAllCards = (event, selected) => {
    setCards(current =>
      Object.fromEntries(Object.values(current).map(card => [card.name, { ...card, selected }]))
    );
  };

  return (
    <>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Limits
          </Typography>
          <Stack direction="row" spacing={2}>
            <LimitSelect label="Min" value={limits.min} onChange={min => setLimits(current => ({ ...current, min }))} />
            <LimitSelect label="Max" value={limits.max} onChange={max => setLimits(current => ({ ...current, max }))} />
          </Stack>
        </Box>
        <Typography variant="subtitle1">Individual cards</Typography>
        <CardTable
          cards={Object.values(cards)}
          columns={['name', 'cost']}
          onToggleCard={toggleCard}
          onToggleAll={toggleAllCards}
          selectable
          sortable={false}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose()}>Cancel</Button>
        <Button onClick={() => onClose({ ...limits, cards })}>Ok</Button>
      </DialogActions>
    </>
  );
}

export default function ExpansionMinMax({ title, open, min, max, onClose }) {
  return (
    <Dialog open={open} onClose={() => onClose()}>
      <ExpansionMinMaxForm title={title} min={min} max={max} onClose={onClose} />
    </Dialog>
  );
}
