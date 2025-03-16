import React from 'react';
import _ from 'lodash';

import QueryCreationTableColumn from './QueryCreationTableColumn';
import { useAppSelector } from '../hooks';

export const QueryCreationTable = () => {
  // Retrieve state using selectors
  const { columns } = useAppSelector((store) => ({
    columns: _.orderBy(store.query.columns, ['filter_as_having'], ['asc']),
  }));

  // Calculate maxConditions from all columns
  const maxConditions = columns.length > 0 ? Math.max(...columns.map((col) => col.column_conditions.length)) : 2;

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

export default QueryCreationTable;
