import React from 'react';
import { Card, CardBody, Form, FormGroup, Row, Button } from 'reactstrap';
import Select from 'react-select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import _ from 'lodash';
import UsingCondition from './UsingCondition';
import { translations } from '../utils/translations';
import { removeUsing, updateUsing } from '../actions/queryActions';
import { useAppSelector, useAppDispatch } from '../hooks';
import { LanguageType } from '../types/settingsType';
import { DatabaseTableType, DatabaseColumnType, DatabaseConstraintType } from '../types/databaseTypes';
import { UsingType, UsingCondition as UsingConditionType } from '../types/queryTypes';

interface UsingProps {
  id: string | number;
  using: UsingType;
  queryId: number;
}

interface SelectOption {
  value: string;
  key: string;
  label: string;
}

interface GroupedOptions {
  label: string;
  options: SelectOption[];
}

export const Using: React.FC<UsingProps> = ({ id, using, queryId }) => {
  const dispatch = useAppDispatch();
  const databaseTables = useAppSelector((state) => state.database.tables) as DatabaseTableType[];
  const columns = useAppSelector((state) => state.database.columns) as DatabaseColumnType[];
  const selectedSchema = useAppSelector((state) => state.database.selectedSchema) as string;
  const constraints = useAppSelector((state) => state.database.constraints) as DatabaseConstraintType[];
  const tables = useAppSelector((state) => state.query.tables);
  const lastTableId = useAppSelector((state) => state.query.lastTableId);
  const language = useAppSelector((state) => state.settings.language) as LanguageType;
  const queryType = useAppSelector((state) => state.query.queryType);

  const constructOptions = (): GroupedOptions[] => {
    const options: GroupedOptions[] = [];
    const newTables: SelectOption[] = [];
    const existingTables: SelectOption[] = [];

    databaseTables.forEach((table) => {
      const value = JSON.stringify(table);
      const option = table.table_name;
      if (table.table_schema === selectedSchema) {
        newTables.push({
          value,
          key: `join-${id}-table-${table.table_name}-query-${queryId}`,
          label: option,
        });
      }
    });

    tables.forEach((table, index) => {
      const value = JSON.stringify(table);
      const option =
        table.table_alias.length > 0 ? `${table.table_name} (${table.table_alias})` : `${table.table_name}`;

      if (index > 0) {
        existingTables.push({
          value,
          key: `join-${id}-table-${table.id}-query-${queryId}`,
          label: option,
        });
      }
    });

    options.push({
      label: translations[language.code].queryBuilder.joinMainTableExisting,
      options: existingTables,
    });
    options.push({
      label: translations[language.code].queryBuilder.joinMainTableNew,
      options: newTables,
    });

    return options;
  };

  const constructNewTableData = (table: DatabaseTableType) => {
    const data = {
      id: lastTableId + 1,
      table_schema: table.table_schema,
      table_name: table.table_name,
      table_type: table.table_type,
      table_alias: '',
    };

    let tableConstraints = _.cloneDeep(constraints);

    tableConstraints = tableConstraints.filter(
      (constraint) => constraint.table_schema === data.table_schema && constraint.table_name === data.table_name,
    );

    let tableColumns = _.cloneDeep(columns);

    // Create a type for the extended column with constraints
    interface ExtendedColumn extends DatabaseColumnType {
      constraints: DatabaseConstraintType[];
    }

    tableColumns = tableColumns
      .filter((column) => column.table_name === data.table_name && column.table_schema === data.table_schema)
      .map((column): ExtendedColumn => {
        const col = { ...column } as ExtendedColumn;

        col.constraints = tableConstraints.filter((constraint) =>
          _.includes(constraint.column_name, column.column_name),
        );

        // Using any here to allow property deletion
        delete (col as any).table_name;
        delete (col as any).table_schema;
        return col;
      });

    return {
      ...data,
      columns: tableColumns,
    };
  };

  const isTableSelected = _.isEmpty(using.main_table.table_name);

  const handleTableChange = (e: any) => {
    const value = JSON.parse(e.value);

    let updatedUsing = _.cloneDeep(using);
    let conditions = _.cloneDeep(using.conditions);

    if (
      _.isEmpty(value.table_name) ||
      (!_.isEmpty(using.main_table.table_name) && !_.isEqual(using.main_table.table_name, value.table_name))
    ) {
      conditions = [];
    }

    if (value.id > 0) {
      updatedUsing = {
        ...updatedUsing,
        main_table: value,
        conditions,
      };

      const data = {
        using: updatedUsing,
        newTable: false,
      };

      dispatch(updateUsing(data));
    } else {
      const newTable = constructNewTableData(value);

      const newTableWithUsing = {
        ...updatedUsing,
        main_table: newTable,
        conditions,
      };

      const data = {
        using: newTableWithUsing,
        newTable: true,
      };

      dispatch(updateUsing(data));
    }
  };

  const handleAddCondition = () => {
    let conditionId = 0;

    if (using.conditions.length > 0) {
      conditionId = using.conditions[using.conditions.length - 1].id + 1;
    }

    const condition: UsingConditionType = {
      id: conditionId,
      main_column: '',
      secondary_table: {
        table_schema: '',
        table_name: '',
        table_alias: '',
      },
      secondary_column: '',
    };

    const updatedUsing = {
      ...using,
      conditions: [...using.conditions, condition],
    };

    const data = {
      using: updatedUsing,
      newTable: false,
    };

    dispatch(updateUsing(data));
  };

  const handleRemove = () => {
    dispatch(removeUsing(using));
  };

  return (
    <div>
      <Form className="border border-secondary rounded mt-2 mb-2 p-3">
        <Row className="ml-3">
          {queryType === 'DELETE' ? 'USING' : 'FROM'}
          <div className="col-5">
            <FormGroup className="m-0">
              <Select
                id="main_table"
                placeholder={translations[language.code].queryBuilder.joinMainTable}
                onChange={handleTableChange}
                options={constructOptions()}
              />
            </FormGroup>
          </div>
          <div className="col-1 d-flex ml-auto pr-2 justify-content-end">
            <FormGroup className="align-self-center m-0">
              <Button size="sm" color="danger" onClick={handleRemove} id={`${id}_remove_join-${queryId}`}>
                <FontAwesomeIcon icon="times" />
              </Button>
            </FormGroup>
          </div>
        </Row>
        <Row>
          <div className="col-12 text-info">
            <Button
              className=""
              outline
              color="info"
              size="sm"
              id="addCondition"
              disabled={isTableSelected}
              onClick={handleAddCondition}
            >
              <FontAwesomeIcon icon="plus" />
            </Button>{' '}
            Add Conditon
          </div>
        </Row>
        {!_.isEmpty(using.conditions) && (
          <Card className="mt-2">
            <CardBody className="py-0 px-2">
              {using.conditions.map((condition: UsingConditionType) => (
                <UsingCondition
                  key={`join-${using.id}-condition-${condition.id}-query-${queryId}`}
                  condition={condition}
                  using={using}
                />
              ))}
            </CardBody>
          </Card>
        )}
      </Form>
    </div>
  );
};

export default Using;
