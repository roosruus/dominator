import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Table, { TableBody, TableCell, TableHead, TableRow, TableSortLabel } from 'material-ui/Table';
import Checkbox from 'material-ui/Checkbox';

class CardTable extends Component {
  constructor(props) {
    super(props);

    this.state = {
      order: 'asc',
      orderBy: 'name'
    };

    this.columnData = [
      { id: 'name', numeric: false, label: 'Card' },
      { id: 'set', numeric: false, label: 'Expansion' },
      { id: 'cost', getter: card => card.cost.value, numeric: true, label: 'Cost' }
    ].filter(column => !props.displayColumns || props.displayColumns.includes(column.id));

    this.handleRequestSort = this.handleRequestSort.bind(this);
    this.getSortedCards = this.getSortedCards.bind(this);
  }

  handleRequestSort(event, property) {
    const orderBy = property;
    let order = 'desc';

    if (this.state.orderBy === property && this.state.order === 'desc') {
      order = 'asc';
    }

    this.setState({ order, orderBy });
  }

  getSortedCards() {
    const { order, orderBy } = this.state;

    let getterFunc = card => card[orderBy];
    for (let column of this.columnData) {
      if (column.id === orderBy) {
        if (column.getter) {
          getterFunc = column.getter;
        }
        break;
      }
    }

    const sortedCards =
      order === 'desc'
        ? this.props.cards.slice().sort((a, b) => (getterFunc(b) < getterFunc(a) ? -1 : 1))
        : this.props.cards.slice().sort((a, b) => (getterFunc(a) < getterFunc(b) ? -1 : 1));
    return sortedCards;
  }

  formatCell(columnId, cardProp) {
    if (columnId !== 'cost') {
      return cardProp;
    }

    let formatted = '';
    if (cardProp) {
      if (cardProp.type === 'money') {
        formatted = `$${cardProp.value}`;
      } else if (cardProp.type === 'potion') {
        formatted = `${cardProp.value}P`;
      } else if (cardProp.type === 'debt') {
        formatted = `${cardProp.value}D`;
      } else {
        formatted = cardProp.value;
      }
    }
    return formatted;
  }

  render() {
    const { selectableRows, sortableHeader } = this.props;
    const { order, orderBy } = this.state;
    return (
      <Table>
        <SortableTableHead
          columnData={this.columnData}
          onRequestSort={this.handleRequestSort}
          order={order}
          orderBy={orderBy}
          disableSorting={!sortableHeader}
          selectableRows={selectableRows}
        />
        <TableBody>
          {this.getSortedCards().map(card => (
            <TableRow key={`result-row-${card.name}`}>
              {selectableRows && (
                <TableCell padding="none">
                  <Checkbox checked={card.selected} onChange={() => this.props.onSelectCard(card)}/>
                </TableCell>
              )}
              {this.columnData.map(({ id }) => (
                <TableCell key={`cell-${card.name}-${id}`}>{this.formatCell(id, card[id])}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }
}

class SortableTableHead extends Component {
  createSortHandler(property) {
    return event => {
      this.props.onRequestSort(event, property);
    };
  }

  render() {
    const { order, orderBy, columnData, disableSorting, selectableRows } = this.props;
    return (
      <TableHead>
        <TableRow>
          {selectableRows && (
            <TableCell padding="none">
              <Checkbox />
            </TableCell>
          )}
          {columnData.map(column => (
            <TableCell key={column.id}>
              {!disableSorting && (
                <TableSortLabel
                  active={orderBy === column.id}
                  direction={order}
                  onClick={this.createSortHandler(column.id)}
                >
                  {column.label}
                </TableSortLabel>
              )}
              {disableSorting && column.label}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
    );
  }
}

CardTable.propTypes = {
  cards: PropTypes.array.isRequired,
  displayColumns: PropTypes.array,
  onSelectCard: PropTypes.func,
  selectableRows: PropTypes.bool,
  sortableHeader: PropTypes.bool
};

CardTable.defaultProps = {
  selectableRows: false,
  sortableHeader: true
};

export default CardTable;
