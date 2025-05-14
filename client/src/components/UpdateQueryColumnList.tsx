import React from 'react';
import { Table } from 'reactstrap';
import _ from 'lodash';
import RemoveColumnButton from './RemoveColumnButton';
import SetInput from './SetInput';
import UpdateSwitch from './UpdateSwitch';
import { useAppSelector } from '../hooks';
import { RootState } from '../store';
import { QueryColumnType } from '../types/queryTypes';

const UpdateQueryColumnList: React.FC = () => {
  const { columns, tables } = useAppSelector((state: RootState) => ({
    columns: state.query.columns,
    tables: state.query.tables,
  }));

  const filteredColumns = _.uniqBy(columns, 'column_name');

  return (
    <div className="mt-2">
      {!!columns.length && (
        <Table style={{ width: 'auto' }}>
          <thead>
            <tr>
              <th className="border-right">Column name</th>
              {filteredColumns.map(
                (column: QueryColumnType) =>
                  column.table_id === tables[0].id && (
                    <th className="border-right" key={`header-${column.id}`}>
                      {column.table_name}.{column.column_name}
                      <RemoveColumnButton column={column} />
                    </th>
                  ),
              )}
            </tr>
          </thead>
          <tbody>
            <tr>
              <th className="border-right">Enabled</th>
              {filteredColumns.map(
                (column: QueryColumnType) =>
                  column.table_id === tables[0].id && (
                    <td className="border-right" key={`enabled-${column.id}`}>
                      <UpdateSwitch column={column} />
                    </td>
                  ),
              )}
            </tr>
            <tr>
              <td className="text-right">SET</td>
              {filteredColumns.map(
                (column: QueryColumnType) =>
                  column.table_id === tables[0].id && (
                    <td key={`set-${column.id}`}>
                      <SetInput column={column} enabled={column.value_enabled} />
                    </td>
                  ),
              )}
            </tr>
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default UpdateQueryColumnList;
