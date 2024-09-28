import React from 'react';
import { connect } from 'react-redux';
import { Label, Button, CustomInput, Table } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { switchReturning, addFilterRow, removeFilterRow, removeColumn } from '../actions/queryActions';
import FilterInput from './FilterInput';
import FilterSwitch from './FilterSwitch';
import RemoveColumnButton from './RemoveColumnButton';

export const NewQueryColumnList = ({
  columns, returning, switchReturning, addFilterRow, removeFilterRow,
}) => {
  const handleFilterRowAdd = () => {
    addFilterRow();
  };

  const handleFilterRowRemove = () => {
    removeFilterRow();
  };

  return (
    <div className="mt-2">
      <Label>Add filter row</Label>
      <Button
        className="mb-1 ml-2"
        outline
        color="info"
        size="sm"
        onClick={handleFilterRowAdd}
      >
        <FontAwesomeIcon icon="plus" />
      </Button>
      <Label className="ml-2">Remove last filter row</Label>
      <Button
        className="mb-1 ml-2"
        outline
        color="info"
        size="sm"
        onClick={handleFilterRowRemove}
      >
        <FontAwesomeIcon icon="times" />
      </Button>
      <CustomInput
        inline
        className="mr-2 ml-2"
        type="switch"
        id="returning"
        checked={returning}
        onChange={switchReturning}
        label="Returning all"
      />

      {!!columns.length
            && (
            <Table style={{ width: 'auto' }}>
              <thead>
                <tr>
                  <th className="border-right">Column name</th>
                  {columns.map((column) => (
                    <th>
                      {column.table_name}
                      .
                      {column.column_name}
                      <RemoveColumnButton
                        column={column}
                      />
                    </th>
                  ))}
                </tr>
                <tr>
                  <th className="border-right">Returning</th>
                  {columns.map((column) => (
                    <td>
                      <FilterSwitch
                        column={column}
                        only={false}
                      />
                    </td>
                  ))}
                </tr>
                <tr>
                  <th className="border-right">Returning only</th>
                  {columns.map((column) => (
                    <td>
                      <FilterSwitch
                        column={column}
                        only
                      />
                    </td>
                  ))}
                </tr>
              </thead>
              <tbody>
                {columns[0].column_filters.map((_, index) => (
                  <tr>
                    <td className="text-right">{index === 0 ? 'WHERE' : 'OR..'}</td>
                    {columns.map((column) => (
                      <td>
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

const mapStateToProps = (store) => ({
  columns: store.query.columns,
  returning: store.query.returning,
});

const mapDispatchToProps = {
  switchReturning,
  addFilterRow,
  removeFilterRow,
  removeColumn,
};

export default connect(mapStateToProps, mapDispatchToProps)(NewQueryColumnList);
