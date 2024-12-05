import React, { useCallback } from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { useSelector, useDispatch } from 'react-redux';
import { CustomInput, FormGroup, Input, InputGroup, UncontrolledTooltip } from 'reactstrap';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { setLimitValue, switchDistinct, switchLimit, switchTies, updateColumnsOrder } from '../actions/queryActions';
import QueryColumn from './QueryColumn';
import FilterOperandSelectbox from './FilterOperandSelectbox';
import { translations } from '../utils/translations';
import QueryCreationTableColumn from './QueryCreationTableColumn';

export const QueryCreationTable = () => {
  const dispatch = useDispatch();

  // Retrieve state using selectors
  const { columns, distinct, limit, limitValue, withTies, language, queryId } = useSelector((store) => ({
    columns: _.orderBy(store.query.columns, ['filter_as_having'], ['asc']),
    distinct: store.query.distinct,
    limit: store.query.limit,
    limitValue: store.query.limitValue.toString(),
    withTies: store.query.withTies,
    language: store.settings.language,
    queryId: store.query.id,
  }));

  const onDragEnd = useCallback(
    (result) => {
      const { destination, source, draggableId } = result;

      if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
        return;
      }

      const movedColumn = columns.find((column) => _.isEqual(draggableId, `query-column-${column.id}`));
      const newColumns = Array.from(columns);

      newColumns.splice(source.index, 1);
      newColumns.splice(destination.index, 0, movedColumn);

      dispatch(updateColumnsOrder(newColumns));
    },
    [columns, dispatch],
  );

  const showFilterOperandSelectbox = useCallback(
    (column, queryColumns, index) =>
      column.column_filter.length &&
      index !== queryColumns.length - 1 &&
      queryColumns[index + 1].column_filter.length &&
      queryColumns[index + 1].filter_as_having === queryColumns[index].filter_as_having,
    [],
  );

  const data = [
    {
      column: 'Name',
      table: 'City',
      aggregate: '',
      sort: '',
      show: true,
      removeDuplicates: false,
      criteria: 'NOT IN {Query1}',
      or1: "LIKE '%M'",
      or2: '',
    },
    {
      column: 'Population',
      table: 'City',
      aggregate: '',
      sort: '',
      show: true,
      removeDuplicates: false,
      criteria: "'P'",
      or1: '',
      or2: '',
    },
  ];

  const tableStyles = {
    fixedWidth: { width: '200px', height: '36px' },
    cellCenter: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '24px', // Match the height of form-control inputs
    },
  };

  const tableLabels = ['Column', 'Table', 'Aggregate', 'Sort', 'Show', 'Remove Duplicates', 'Criteria', 'Or'];

  return (
    <table className="table table-bordered query-creation-table" style={{ width: 'auto' }}>
      <tbody>
        <td className="bg-light">
          <table>
            {tableLabels.map((label, index) => (
              <tr key={index} style={{ height: '56px' }}>
                <td className="bg-light" style={{ width: '200px' }}>
                  {label}
                </td>
              </tr>
            ))}
          </table>
        </td>
        {columns.map((column, index) => (
          <QueryCreationTableColumn key={index} data={column} id={`query-column-${column.id}`} index={index} />
        ))}
      </tbody>
    </table>
  );
};

QueryCreationTable.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape({ column_filter: PropTypes.string })),
  updateColumns: PropTypes.func,
  distinct: PropTypes.bool,
  switchDistinctProp: PropTypes.func,
  limit: PropTypes.bool,
  switchLimitProp: PropTypes.func,
  limitValue: PropTypes.string,
  setLimitValueProp: PropTypes.func,
  language: PropTypes.shape({ code: PropTypes.string }),
  queryId: PropTypes.number,
  withTies: PropTypes.bool,
  switchWithTiesProp: PropTypes.func,
};

export default QueryCreationTable;
