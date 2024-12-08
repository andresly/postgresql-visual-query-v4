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

  // Calculate maxConditions from all columns
  const maxConditions = columns.length > 0 ? Math.max(...columns.map((col) => col.column_conditions.length)) : 2;

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

  // Create dynamic table labels array
  const baseLabels = [
    'Column',
    'Alias',
    'Table',
    'Aggregate',
    'Scalar function',
    'Sort',
    'Sort order',
    'Show',
    'Remove Duplicates',
    'Criteria',
  ];
  const tableLabels = [
    ...baseLabels,
    ...Array(maxConditions - 1).fill('Or'), // Add "Or" labels for remaining conditions
  ];

  return (
    <table className="table table-bordered query-creation-table" style={{ width: 'auto' }}>
      <td>
        <table style={{ background: '#D9D9D9' }}>
          {tableLabels.map((label, index) => (
            <tr key={index} style={{ height: '56px' }}>
              <td style={{ minWidth: '200px' }}>{label}</td>
            </tr>
          ))}
        </table>
      </td>
      {columns.map((column, index) => (
        <QueryCreationTableColumn key={index} data={column} id={`query-column-${column.id}`} index={index} />
      ))}
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
