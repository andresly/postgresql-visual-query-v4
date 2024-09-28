import React from 'react';
import { connect } from 'react-redux';
import { Table } from 'reactstrap';
import _ from 'lodash';
import RemoveColumnButton from './RemoveColumnButton';
import SetInput from './SetInput';
import UpdateSwitch from './UpdateSwitch';

export const UpdateQueryColumnList = ({ columns, tables }) => {
  const filteredColumns = _.uniqBy(columns, 'column_name');

  return (
    <div className="mt-2">
      {!!columns.length
            && (
            <Table style={{ width: 'auto' }}>
              <thead>
                <tr>
                  <th className="border-right">Column name</th>
                  {filteredColumns.map((column) => (
                    (column.table_id === tables[0].id
                        && (
                        <th className="border-right">
                          {column.table_name}
                          .
                          {column.column_name}
                          <RemoveColumnButton
                            column={column}
                          />
                        </th>
                        )
                    )
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th className="border-right">Enabled</th>
                  {filteredColumns.map((column) => (
                    (column.table_id === tables[0].id
                        && (
                        <td className="border-right">
                          <UpdateSwitch
                            column={column}
                          />
                        </td>
                        ))
                  ))}
                </tr>
                <tr>
                  <td className="text-right">SET</td>
                  {filteredColumns.map((column) => (
                    (column.table_id === tables[0].id
                            && (
                            <td>
                              <SetInput
                                column={column}
                                enabled={column.value_enabled}
                              />
                            </td>
                            )
                    )
                  ))}
                </tr>
              </tbody>
            </Table>
            )}
    </div>
  );
};

const mapStateToProps = (store) => ({
  columns: store.query.columns,
  tables: store.query.tables,
});

export default connect(mapStateToProps, null)(UpdateQueryColumnList);
