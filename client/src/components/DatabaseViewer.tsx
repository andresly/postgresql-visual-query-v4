import React from 'react';
import { Scrollbars } from 'react-custom-scrollbars';
import _ from 'lodash';
import DatabaseTable from './DatabaseTable';
import { filterTable } from '../utils/filterTable';
import { useAppSelector } from '../hooks';
import { DatabaseTableType, DatabaseColumnType, DatabaseConstraintType } from '../types/databaseTypes';
import { QueryTableType } from '../types/queryTypes';

interface ConstructedDataType {
  table_schema: string;
  table_name: string;
  table_type: string;
  table_alias: string;
  columns: DatabaseColumnType[];
}

export const DatabaseViewer: React.FC = () => {
  const {
    tables: databaseTables,
    selectedSchema,
    constraints,
    columns,
    searchExpr,
  } = useAppSelector((state) => state.database);
  const { tables: queryTables, queryType } = useAppSelector((state) => state.query);

  const constructData = (table: DatabaseTableType): ConstructedDataType => {
    const data = {
      table_schema: table.table_schema,
      table_name: table.table_name,
      table_type: table.table_type,
      table_alias: '',
    } as ConstructedDataType;

    let tableConstraints: DatabaseConstraintType[] = JSON.parse(JSON.stringify(constraints));

    tableConstraints = tableConstraints.filter(
      (constraint) => constraint.table_schema === data.table_schema && constraint.table_name === data.table_name,
    );

    let tableColumns: DatabaseColumnType[] = JSON.parse(JSON.stringify(columns));

    tableColumns = tableColumns
      .filter((column) => column.table_name === data.table_name && column.table_schema === data.table_schema)
      .map((column) => {
        const col = { ...column } as any;

        col.constraints = tableConstraints.filter((constraint) =>
          _.includes(constraint.column_name, column.column_name),
        );

        delete col.table_name;
        delete col.table_schema;
        return col;
      });

    data.columns = tableColumns;

    return data;
  };

  return (
    <div className="flex-fill">
      <Scrollbars className="d-flex" autoHide>
        <div className="mt-1 pr-2">
          {databaseTables.map((table, index) => {
            const checked = queryTables.some(
              (qt: QueryTableType) =>
                _.isEqual(table.table_name, qt.table_name) && _.isEqual(table.table_schema, qt.table_schema),
            );

            const id = `database-table-${index}`;

            return (
              table.table_schema === selectedSchema &&
              filterTable(table, searchExpr) && (
                <DatabaseTable data={constructData(table)} checked={checked} key={id} id={id} queryType={queryType} />
              )
            );
          })}
        </div>
      </Scrollbars>
    </div>
  );
};

export default DatabaseViewer;
