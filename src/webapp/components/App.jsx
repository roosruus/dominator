import { useDispatch, useSelector } from 'react-redux';
import { AppBar, Box, Button, Card, CardContent, Toolbar, Typography } from '@mui/material';

import ExpansionList from './ExpansionList';
import ApplyRecommendedRules from './ApplyRecommendedRules';
import CardTable from './CardTable';
import { shuffleKingdom } from '../store/pickedCardsSlice';
import { selectPickedCards } from '../store/selectors';

export default function App() {
  const dispatch = useDispatch();
  const { kingdomCards, additionalCards } = useSelector(selectPickedCards);

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="h1" sx={{ flexGrow: 1 }}>
            Shuffle My Kingdom
          </Typography>
          <Button color="inherit" onClick={() => dispatch(shuffleKingdom())}>
            Shuffle
          </Button>
        </Toolbar>
      </AppBar>
      <Card>
        <CardContent>
          <ExpansionList />
          <ApplyRecommendedRules />
        </CardContent>
      </Card>
      {kingdomCards && (
        <Card sx={{ mt: 3, px: { xs: 2, sm: 3 }, py: 2 }}>
          <Typography variant="h6" component="h2">
            Kingdom cards
          </Typography>
          <CardTable cards={kingdomCards} />
          {additionalCards?.length > 0 && (
            <>
              <Typography variant="h6" component="h2" sx={{ mt: 2 }}>
                Additional cards
              </Typography>
              <CardTable cards={additionalCards} />
            </>
          )}
        </Card>
      )}
    </Box>
  );
}
