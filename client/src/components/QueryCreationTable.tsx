import React from 'react';
import _ from 'lodash';
import { CustomInput, FormGroup, Input, InputGroup, UncontrolledTooltip } from 'reactstrap';

import QueryCreationTableColumn from './QueryCreationTableColumn';
import { useAppSelector, useAppDispatch } from '../hooks';
import { switchDistinct, switchLimit, switchTies, setLimitValue } from '../actions/queryActions';

export const QueryCreationTable = () => {
  const dispatch = useAppDispatch();
  // Retrieve state using selectors
  const { columns, distinct, limit, limitValue, withTies } = useAppSelector((store) => ({
    columns: _.orderBy(store.query.columns, ['filter_as_having'], ['asc']),
    distinct: store.query.distinct,
    limit: store.query.limit,
    limitValue: store.query.limitValue,
    withTies: store.query.withTies,
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
    <div>
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
      <div className="mt-3">
        <FormGroup className="d-flex align-items-center">
          <CustomInput
            type="switch"
            id="distinct"
            label="Remove duplicate rows"
            checked={distinct}
            onChange={() => dispatch(switchDistinct())}
          />
          <CustomInput
            className="ml-2 mr-2"
            type="switch"
            id="limit_switch"
            label="Limit row number"
            checked={limit}
            onChange={() => dispatch(switchLimit())}
          />
          {limit && (
            <InputGroup className="w-auto" size="sm">
              <Input
                id="limit"
                placeholder="Value"
                value={limitValue || ''}
                min={0}
                max={999}
                type="number"
                step="1"
                onChange={(e) => dispatch(setLimitValue(parseInt(e.target.value, 10)))}
              />
              <UncontrolledTooltip placement="top" delay={{ show: 500, hide: 0 }} target="limit">
                Limit value
              </UncontrolledTooltip>
              <CustomInput
                className="ml-2"
                type="switch"
                id="ties_switch"
                label="With ties"
                checked={withTies}
                onChange={() => dispatch(switchTies())}
              />
            </InputGroup>
          )}
        </FormGroup>
      </div>
    </div>
  );
};

export default QueryCreationTable;
