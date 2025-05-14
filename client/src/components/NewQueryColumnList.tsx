import React from 'react';
import { Label, Button, CustomInput, Table } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { switchReturning, addFilterRow, removeFilterRow } from '../actions/queryActions';
import { useAppSelector, useAppDispatch } from '../hooks';
import { QueryColumnType } from '../types/queryTypes';
import FilterInput from './FilterInput';
import FilterSwitch from './FilterSwitch';
import RemoveColumnButton from './RemoveColumnButton';

export const NewQueryColumnList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { columns, returning } = useAppSelector((state) => ({
    columns: state.query.columns,
    returning: state.query.returning,
  }));

  const handleFilterRowAdd = () => {
    dispatch(addFilterRow());
  };

  const handleFilterRowRemove = () => {
    dispatch(removeFilterRow());
  };

  const handleSwitchReturning = () => {
    dispatch(switchReturning());
  };

  return (
    <div className="mt-2">
      <Label>Add filter row</Label>
      <Button className="mb-1 ml-2" outline color="info" size="sm" onClick={handleFilterRowAdd}>
        <FontAwesomeIcon icon="plus" />
      </Button>
      <Label className="ml-2">Remove last filter row</Label>
      <Button className="mb-1 ml-2" outline color="info" size="sm" onClick={handleFilterRowRemove}>
        <FontAwesomeIcon icon="times" />
      </Button>
      <CustomInput
        inline
        className="mr-2 ml-2"
        type="switch"
        id="returning"
        checked={returning}
        onChange={handleSwitchReturning}
        label="Returning all"
      />

      {!!columns.length && (
        <Table style={{ width: 'auto' }}>
          <thead>
            <tr>
              <th className="border-right">Column name</th>
              {columns.map((column: QueryColumnType) => (
                <th key={`column-name-${column.id}`}>
                  {column.table_name}.{column.column_name}
                  <RemoveColumnButton column={column} />
                </th>
              ))}
            </tr>
            <tr>
              <th className="border-right">Returning</th>
              {columns.map((column: QueryColumnType) => (
                <td key={`column-returning-${column.id}`}>
                  <FilterSwitch column={column} only={false} />
                </td>
              ))}
            </tr>
            <tr>
              <th className="border-right">Returning only</th>
              {columns.map((column: QueryColumnType) => (
                <td key={`column-returning-only-${column.id}`}>
                  <FilterSwitch column={column} only />
                </td>
              ))}
            </tr>
          </thead>
          <tbody>
            {columns[0]?.column_filters.map((_, index) => (
              <tr key={`filter-row-${index}`}>
                <td className="text-right">{index === 0 ? 'WHERE' : 'OR..'}</td>
                {columns.map((column: QueryColumnType) => (
                  <td key={`filter-input-${column.id}-${index}`}>
                    <FilterInput
                      returningOnly={column.returningOnly}
                      columnId={column.id}
                      filterId={index}
                      value={column.column_filters[index].filter}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default NewQueryColumnList;
