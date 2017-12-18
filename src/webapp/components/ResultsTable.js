import React, { Component } from 'react';
import Table, { TableBody, TableCell, TableHead, TableRow, TableSortLabel } from 'material-ui/Table';
import Tooltip from 'material-ui/Tooltip';


class ResultsTable extends Component {
  constructor(props) {
    super(props);

    this.state = {
      order: 'asc',
      orderBy: 'name'
    };

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
    for(let column of this.columnData) {
      if(column.id === orderBy) {
        if(column.getter) {
          getterFunc = column.getter;
        }
        break;
      }
    }
    
    const sortedCards =
      order === 'desc'
        ? this.props.pickedCards.slice().sort((a, b) => (getterFunc(b) < getterFunc(a) ? -1 : 1))
        : this.props.pickedCards.slice().sort((a, b) => (getterFunc(a) < getterFunc(b) ? -1 : 1));
    return sortedCards;
  }

  render() {
    
    const { order, orderBy } = this.state;
    return (
      <Table>
        <SortableTableHead
          columnData={this.columnData}
          onRequestSort={this.handleRequestSort}
          order={order}
          orderBy={orderBy}
        />
        <TableBody>
          {this.getSortedCards().map(card => (
            <TableRow key={`result-row-${card.name}`}>
              <TableCell>{card.name}</TableCell>
              <TableCell>{card.set}</TableCell>
              <TableCell>{card.cost.value}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }
}

ResultsTable.prototype.columnData = [
  { id: 'name', numeric: false, label: 'Card' },
  { id: 'set', numeric: false, label: 'Expansion' },
  { id: 'cost', getter: card => card.cost.value, numeric: true, label: 'Cost' }
];


class SortableTableHead extends Component {
  createSortHandler(property) {
    return event => {
      this.props.onRequestSort(event, property);
    };
  }

  render() {
    const { order, orderBy, columnData } = this.props;
    return (
      <TableHead>
        <TableRow>
          {columnData.map(column => (
            <TableCell key={column.id}>
              <TableSortLabel
                active={orderBy === column.id}
                direction={order}
                onClick={this.createSortHandler(column.id)}
              >
                {column.label}
              </TableSortLabel>
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
    );
  }
}

export default ResultsTable;
