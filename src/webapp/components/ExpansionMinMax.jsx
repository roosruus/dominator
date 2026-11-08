import { useState } from 'react';
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
import { getKingdomCardsInExpansion } from '../engine';
import { MAX_KINGDOM_CARDS } from '../engine/rules';

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

// Rendered only while the dialog is open, so its state starts fresh from the props each time.
function ExpansionMinMaxForm({ title, min, max, excludedCards, onClose }) {
  const [kingdomCards] = useState(() => getKingdomCardsInExpansion(title));
  const [limits, setLimits] = useState({ min, max });
  const [excluded, setExcluded] = useState(() => new Set(excludedCards));

  const cards = kingdomCards.map(card => ({ ...card, selected: !excluded.has(card.name) }));

  const toggleCard = card => {
    setExcluded(current => {
      const next = new Set(current);
      if (next.has(card.name)) {
        next.delete(card.name);
      } else {
        next.add(card.name);
      }
      return next;
    });
  };

  const toggleAllCards = (event, selected) => {
    setExcluded(selected ? new Set() : new Set(kingdomCards.map(card => card.name)));
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
          cards={cards}
          columns={['name', 'cost']}
          onToggleCard={toggleCard}
          onToggleAll={toggleAllCards}
          selectable
          sortable={false}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose()}>Cancel</Button>
        <Button onClick={() => onClose({ ...limits, excludedCards: [...excluded] })}>Ok</Button>
      </DialogActions>
    </>
  );
}

export default function ExpansionMinMax({ title, open, min, max, excludedCards, onClose }) {
  return (
    <Dialog open={open} onClose={() => onClose()}>
      <ExpansionMinMaxForm title={title} min={min} max={max} excludedCards={excludedCards} onClose={onClose} />
    </Dialog>
  );
}
