import { useMemo, useState } from 'react';
import { Checkbox, Table, TableBody, TableCell, TableHead, TableRow, TableSortLabel } from '@mui/material';

const formatCost = cost => {
  if (!cost) {
    return '';
  }
  switch (cost.type) {
    case 'money':
      return `$${cost.value}`;
    case 'potion':
      return `${cost.value}P`;
    case 'debt':
      return `${cost.value}D`;
    default:
      return cost.value;
  }
};

const COLUMNS = [
  { id: 'name', label: 'Card', sortValue: card => card.name },
  { id: 'set', label: 'Expansion', sortValue: card => card.set },
  { id: 'cost', label: 'Cost', sortValue: card => card.cost?.value ?? 0, format: formatCost }
];

const compare = (a, b) => (typeof a === 'string' ? a.localeCompare(b) : a - b);

export default function CardTable({
  cards,
  columns = ['name', 'set', 'cost'],
  selectable = false,
  sortable = true,
  onToggleCard,
  onToggleAll
}) {
  const [sort, setSort] = useState({ orderBy: 'name', order: 'asc' });
  const visibleColumns = COLUMNS.filter(column => columns.includes(column.id));

  const sortedCards = useMemo(() => {
    const { sortValue } = COLUMNS.find(column => column.id === sort.orderBy);
    const direction = sort.order === 'asc' ? 1 : -1;
    return [...cards].sort((a, b) => direction * compare(sortValue(a), sortValue(b)));
  }, [cards, sort]);

  const handleSort = columnId => {
    setSort(current => ({
      orderBy: columnId,
      order: current.orderBy === columnId && current.order === 'asc' ? 'desc' : 'asc'
    }));
  };

  const numSelected = cards.filter(card => card.selected).length;
  const allSelected = numSelected === cards.length;

  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          {selectable && (
            <TableCell padding="checkbox">
              <Checkbox
                checked={allSelected}
                indeterminate={numSelected > 0 && !allSelected}
                onChange={onToggleAll}
                slotProps={{ input: { 'aria-label': 'Select all cards' } }}
              />
            </TableCell>
          )}
          {visibleColumns.map(column => (
            <TableCell key={column.id} sortDirection={sort.orderBy === column.id ? sort.order : false}>
              {sortable ? (
                <TableSortLabel
                  active={sort.orderBy === column.id}
                  direction={sort.orderBy === column.id ? sort.order : 'asc'}
                  onClick={() => handleSort(column.id)}
                >
                  {column.label}
                </TableSortLabel>
              ) : (
                column.label
              )}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {sortedCards.map(card => (
          <TableRow key={card.name}>
            {selectable && (
              <TableCell padding="checkbox">
                <Checkbox
                  checked={card.selected}
                  onChange={() => onToggleCard(card)}
                  slotProps={{ input: { 'aria-label': card.name } }}
                />
              </TableCell>
            )}
            {visibleColumns.map(({ id, format }) => (
              <TableCell key={id}>{format ? format(card[id]) : card[id]}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
