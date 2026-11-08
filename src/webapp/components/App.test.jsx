import { describe, expect, it } from 'vitest';
import { render, screen, waitForElementToBeRemoved, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';

import App from './App';
import { createStore } from '../store';

const renderApp = () => {
  const user = userEvent.setup();
  render(
    <Provider store={createStore()}>
      <App />
    </Provider>
  );
  return user;
};

const kingdomRows = () => within(screen.getAllByRole('table')[0]).getAllByRole('row').slice(1);
const column = (rows, index) => rows.map(row => within(row).getAllByRole('cell')[index].textContent);

const openSeasideSettings = async user => {
  await user.click(screen.getByRole('button', { name: /^Expansions/ }));
  await user.click(screen.getByRole('button', { name: 'Seaside settings' }));
  return screen.getByRole('dialog');
};

describe('App', () => {
  it('shows a kingdom of 10 cards after shuffling', async () => {
    const user = renderApp();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Shuffle' }));

    expect(screen.getByRole('heading', { name: 'Kingdom cards' })).toBeInTheDocument();
    expect(kingdomRows()).toHaveLength(10);
  });

  it('sorts the kingdom by cost', async () => {
    const user = renderApp();
    await user.click(screen.getByRole('button', { name: 'Shuffle' }));
    const costButton = within(screen.getAllByRole('table')[0]).getByRole('button', { name: 'Cost' });
    const costs = () => column(kingdomRows(), 2).map(cost => parseInt(cost.replace(/\D/g, ''), 10));

    await user.click(costButton);
    expect(costs()).toEqual([...costs()].sort((a, b) => a - b));

    await user.click(costButton);
    expect(costs()).toEqual([...costs()].sort((a, b) => b - a));
  });

  it('shuffles only from the selected expansions', async () => {
    const user = renderApp();
    await user.click(screen.getByRole('button', { name: /^Expansions/ }));
    await user.click(screen.getByRole('checkbox', { name: 'Select all expansions' }));
    await user.click(screen.getByRole('checkbox', { name: 'Guilds' }));

    await user.click(screen.getByRole('button', { name: 'Shuffle' }));

    expect(new Set(column(kingdomRows(), 1))).toEqual(new Set(['Guilds']));
    expect(screen.getByText('Guilds', { selector: 'p' })).toBeInTheDocument();
  });

  it('saves expansion limits and card selections from the settings dialog', async () => {
    const user = renderApp();
    const dialog = await openSeasideSettings(user);

    await user.selectOptions(within(dialog).getByLabelText('Min'), '3');
    await user.click(within(dialog).getByRole('checkbox', { name: 'Lighthouse' }));
    await user.click(within(dialog).getByRole('button', { name: 'Ok' }));
    await waitForElementToBeRemoved(dialog);

    expect(screen.getByText('Min: 3, Max: 10')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Seaside settings' }));
    const reopened = screen.getByRole('dialog');
    expect(within(reopened).getByLabelText('Min')).toHaveValue('3');
    expect(within(reopened).getByRole('checkbox', { name: 'Lighthouse' })).not.toBeChecked();
  });

  it('discards dialog changes on cancel', async () => {
    const user = renderApp();
    const dialog = await openSeasideSettings(user);

    await user.selectOptions(within(dialog).getByLabelText('Max'), '2');
    await user.click(within(dialog).getByRole('checkbox', { name: 'Lighthouse' }));
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    await waitForElementToBeRemoved(dialog);

    expect(screen.queryByText(/Max: 2/)).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Seaside settings' }));
    expect(within(screen.getByRole('dialog')).getByRole('checkbox', { name: 'Lighthouse' })).toBeChecked();
  });

  it('toggles the recommended rules', async () => {
    const user = renderApp();
    const toggle = screen.getByRole('switch', { name: 'Apply recommended rules' });
    expect(toggle).toBeChecked();
    await user.click(toggle);
    expect(toggle).not.toBeChecked();
  });
});
