import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Button, ButtonDropdown, DropdownToggle, DropdownItem, DropdownMenu, CustomInput, Label, Table } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import RemoveColumnButton from './RemoveColumnButton';
import FilterSwitch from './FilterSwitch';
import ValueInput from './ValueInput';
import { addRows, removeRows, switchFromQuery, updateFromQuery, switchReturning, changeDefaultValue } from '../actions/queryActions';
import { getCorrectQueryName } from '../utils/getCorrectQueryName';

export const InsertQueryColumnList = ({
  columns, addRows, removeRows, queries, switchFromQuery,
  fromQuery, updateFromQuery, switchReturning, returning,
  language, defaultValue, changeDefaultValue,
}) => {
  const [dropDownOpen, setDropDownOpen] = useState(false);

  const handleAddRow = () => {
    addRows();
  };

  const handleRemoveRow = () => {
    removeRows();
  };

  const handleDropDown = () => {
    setDropDownOpen(current => !current);
  };

  const handleSave = (e) => {
    let subQuery;

    if (e.currentTarget.name === 'subqueryDefault') {
      subQuery = {
        subqueryId: 0,
        subquerySql: '',
      };
    } else if (e.currentTarget.name === 'subqueryId') {
      const subqueryId = +e.target.value;
      const subquerySql = queries.find(query => query.id === subqueryId).sql;
      subQuery = {
        subqueryId,
        subquerySql,
      };
    }

    updateFromQuery(subQuery);
  };

  return (
    <div className="mt-2">
      <Label>Add row</Label>
      <Button
        className="mb-1 ml-2"
        outline
        color="info"
        size="sm"
        disabled={fromQuery}
        onClick={handleAddRow}
      >
        <FontAwesomeIcon icon="plus" />
      </Button>
      <Label className="ml-2">Remove last row</Label>
      <Button
        className="mb-1 ml-2"
        outline
        color="info"
        size="sm"
        disabled={fromQuery}
        onClick={handleRemoveRow}
      >
        <FontAwesomeIcon icon="times" />
      </Button>
      <CustomInput
        inline
        className="mr-2 ml-2"
        type="switch"
        id="defaultValue"
        checked={defaultValue !== 'DEFAULT'}
        onChange={changeDefaultValue}
        label="Change DEFAULT to NULL"
      />
      <CustomInput
        inline
        className="mr-2 ml-2"
        type="switch"
        id="returning"
        checked={returning}
        onChange={switchReturning}
        label="Returning all"
      />
      <CustomInput
        inline
        className="mr-2 ml-2"
        type="switch"
        id="fromQuery"
        label="Insert from query"
        checked={fromQuery}
        onChange={switchFromQuery}
      />
      {fromQuery && (
      <ButtonDropdown
        isOpen={dropDownOpen}
        toggle={handleDropDown}
      >
        <DropdownToggle
          className="btn-sm btn-light btn-outline-secondary"
          style={{ borderColor: '#d3d8de' }}
          caret
        >
          QueryName
        </DropdownToggle>
        <DropdownMenu>
          <DropdownItem
            key="query-link-SQ"
            name="subqueryDefault"
            value=""
            onClick={handleSave}
          >
            LinkQuery
          </DropdownItem>
          {queries.map((query, index) => (
            <DropdownItem
              key={`query-${query.id}-column`}
              id={`subquerySql-${index}`}
              name="subqueryId"
              value={query.id}
              onClick={handleSave}
            >
              {getCorrectQueryName(language, query.queryName, query.id)}
            </DropdownItem>
          ))}
        </DropdownMenu>
      </ButtonDropdown>
      )}
      {!!columns.length
            && (
            <Table style={{ width: 'auto' }}>
              <thead>
                <tr>
                  <th className="border-right">Column name</th>
                  {columns.map((column) => (
                    <th className="border-right">
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
                    <td className="border-right">
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
                    <td className="border-right">
                      <FilterSwitch
                        column={column}
                        only
                      />
                    </td>
                  ))}
                </tr>
              </thead>
              <tbody>
                {!fromQuery && columns[0].column_values.map((_, index) => (
                  <tr>
                    <td className="text-right">{index === 0 ? 'VALUES' : ''}</td>
                    {columns.map((column) => (
                      <td>
                        <ValueInput
                          column={column}
                          index={index}
                          fromQuery={fromQuery}
                          returningOnly={column.returningOnly}
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
  rows: store.query.rows,
  queries: store.queries,
  fromQuery: store.query.fromQuery,
  returning: store.query.returning,
  language: store.settings.language,
  defaultValue: store.query.defaultValue,
});

const mapDispatchToProps = {
  addRows,
  removeRows,
  switchFromQuery,
  updateFromQuery,
  switchReturning,
  changeDefaultValue,
};

export default connect(mapStateToProps, mapDispatchToProps)(InsertQueryColumnList);
