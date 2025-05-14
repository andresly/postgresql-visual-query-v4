import React, { useState } from 'react';
import {
  Button,
  ButtonDropdown,
  DropdownToggle,
  DropdownItem,
  DropdownMenu,
  CustomInput,
  Label,
  Table,
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAppDispatch, useAppSelector } from '../hooks';
import RemoveColumnButton from './RemoveColumnButton';
import FilterSwitch from './FilterSwitch';
import ValueInput from './ValueInput';
import {
  addRows,
  removeRows,
  switchFromQuery,
  updateFromQuery,
  switchReturning,
  changeDefaultValue,
} from '../actions/queryActions';
import { getCorrectQueryName } from '../utils/getCorrectQueryName';

export const InsertQueryColumnList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { columns, queries, fromQuery, returning, language, defaultValue } = useAppSelector((state) => ({
    columns: state.query.columns,
    queries: state.queries,
    fromQuery: state.query.fromQuery,
    returning: state.query.returning,
    language: state.settings.language,
    defaultValue: state.query.defaultValue,
  }));

  const [dropDownOpen, setDropDownOpen] = useState(false);

  const handleAddRow = () => {
    dispatch(addRows());
  };

  const handleRemoveRow = () => {
    dispatch(removeRows());
  };

  const handleDropDown = () => {
    setDropDownOpen((current) => !current);
  };

  const handleSave = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.currentTarget as HTMLElement & { name?: string; value?: string };
    let subQuery: { subqueryId: number; subquerySql: string };

    if (target.name === 'subqueryDefault') {
      subQuery = {
        subqueryId: 0,
        subquerySql: '',
      };
    } else if (target.name === 'subqueryId' && target.value) {
      const subqueryId = +target.value;
      const subquerySql = queries.find((query) => query.id === subqueryId)?.sql || '';
      subQuery = {
        subqueryId,
        subquerySql,
      };
    } else {
      return;
    }

    dispatch(updateFromQuery(subQuery));
  };

  return (
    <div className="mt-2">
      <Label>Add row</Label>
      <Button className="mb-1 ml-2" outline color="info" size="sm" disabled={fromQuery} onClick={handleAddRow}>
        <FontAwesomeIcon icon="plus" />
      </Button>
      <Label className="ml-2">Remove last row</Label>
      <Button className="mb-1 ml-2" outline color="info" size="sm" disabled={fromQuery} onClick={handleRemoveRow}>
        <FontAwesomeIcon icon="times" />
      </Button>
      <CustomInput
        inline
        className="mr-2 ml-2"
        type="switch"
        id="defaultValue"
        checked={defaultValue !== 'DEFAULT'}
        onChange={() => dispatch(changeDefaultValue(defaultValue))}
        label="Change DEFAULT to NULL"
      />
      <CustomInput
        inline
        className="mr-2 ml-2"
        type="switch"
        id="returning"
        checked={returning}
        onChange={() => dispatch(switchReturning())}
        label="Returning all"
      />
      <CustomInput
        inline
        className="mr-2 ml-2"
        type="switch"
        id="fromQuery"
        label="Insert from query"
        checked={fromQuery}
        onChange={() => dispatch(switchFromQuery())}
      />
      {fromQuery && (
        <ButtonDropdown isOpen={dropDownOpen} toggle={handleDropDown}>
          <DropdownToggle className="btn-sm btn-light btn-outline-secondary" style={{ borderColor: '#d3d8de' }} caret>
            QueryName
          </DropdownToggle>
          <DropdownMenu>
            <DropdownItem key="query-link-SQ" name="subqueryDefault" value="" onClick={handleSave}>
              LinkQuery
            </DropdownItem>
            {queries.map((query) => (
              <DropdownItem
                key={`query-${query.id}-column`}
                id={`subquerySql-${query.id}`}
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
      {!!columns.length && (
        <Table style={{ width: 'auto' }}>
          <thead>
            <tr>
              <th className="border-right">Column name</th>
              {columns.map((column) => (
                <th key={column.id} className="border-right">
                  {column.table_name}.{column.column_name}
                  <RemoveColumnButton column={column} />
                </th>
              ))}
            </tr>
            <tr>
              <th className="border-right">Returning</th>
              {columns.map((column) => (
                <td key={column.id} className="border-right">
                  <FilterSwitch column={column} only={false} />
                </td>
              ))}
            </tr>
            <tr>
              <th className="border-right">Returning only</th>
              {columns.map((column) => (
                <td key={column.id} className="border-right">
                  <FilterSwitch column={column} only />
                </td>
              ))}
            </tr>
          </thead>
          <tbody>
            {!fromQuery &&
              columns[0]?.column_values.map((_, index) => (
                <tr key={index}>
                  <td className="text-right">{index === 0 ? 'VALUES' : ''}</td>
                  {columns.map((column) => (
                    <td key={column.id}>
                      <ValueInput column={column} index={index} returningOnly={column.returningOnly} />
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

export default InsertQueryColumnList;
