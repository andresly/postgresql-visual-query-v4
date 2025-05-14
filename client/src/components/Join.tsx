import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { Button, Card, CardBody, Container, CustomInput, Form, FormGroup, Row, UncontrolledTooltip } from 'reactstrap';
import Select, { SingleValue, ActionMeta } from 'react-select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import _ from 'lodash';
import { useAppDispatch, useAppSelector } from '../hooks';
import { removeJoin, updateJoin, updateJoinNewTable } from '../actions/queryActions';
import { JoinCondition } from './JoinCondition';
import { translations } from '../utils/translations';
import { QueryTableType, JoinType, JoinConditionType } from '../types/queryTypes';
import { DatabaseTableType, DatabaseColumnType, DatabaseConstraintType } from '../types/databaseTypes';

interface JoinProps {
  id: string;
  index: number;
  queryId: number;
  join: JoinType;
}

interface SelectOption {
  value: string;
  label: string;
  key?: string;
}

interface SelectOptionGroup {
  label: string;
  options: SelectOption[];
}

export const Join: React.FC<JoinProps> = ({ id, index, queryId, join }) => {
  const dispatch = useAppDispatch();
  const { databaseTables, columns, selectedSchema, constraints, tables, language } = useAppSelector((state) => ({
    databaseTables: state.database.tables,
    columns: state.database.columns,
    selectedSchema: state.database.selectedSchema,
    constraints: state.database.constraints,
    tables: state.query.tables,
    language: state.settings.language,
  }));

  const constructOptions = () => {
    const options: SelectOptionGroup[] = [];
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
        existingTables.push({ value, key: `join-${id}-table-${table.id}-query-${queryId}`, label: option });
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

  const constructNewTableData = (table: DatabaseTableType): QueryTableType => {
    const data: Partial<QueryTableType> = {
      table_schema: table.table_schema,
      table_name: table.table_name,
      table_type: table.table_type,
      table_alias: '',
      id: 0,
      columns: [],
      selectIndex: 0,
    };

    let filteredConstraints = constraints.filter(
      (constraint) => constraint.table_schema === data.table_schema && constraint.table_name === data.table_name,
    );

    let filteredColumns = columns
      .filter((column) => column.table_name === data.table_name && column.table_schema === data.table_schema)
      .map((column) => {
        const col = { ...column };
        (col as any).constraints = filteredConstraints.filter((constraint) =>
          _.includes(constraint.column_name, column.column_name),
        );
        return col;
      });

    return { ...data, columns: filteredColumns } as QueryTableType;
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    const updatedJoin = {
      ..._.cloneDeep(join),
      type: e.target.value,
    };

    dispatch(updateJoin(updatedJoin));
  };

  const handleTableChange = (newValue: SingleValue<SelectOption>, actionMeta: ActionMeta<SelectOption>) => {
    if (!newValue) return;

    const value = JSON.parse(newValue.value);

    let updatedJoin = _.cloneDeep(join);
    let conditions = _.cloneDeep(join.conditions);

    if (
      _.isEmpty(value.table_name) ||
      (!_.isEmpty(join.main_table.table_name) && !_.isEqual(join.main_table.table_name, value.table_name))
    ) {
      conditions = [];
    }

    if (value.id > 0) {
      updatedJoin = {
        ...updatedJoin,
        main_table: value,
        conditions,
      };

      dispatch(updateJoin(updatedJoin));
    } else {
      const newTable = constructNewTableData(value);

      const newTableWithJoin = {
        ...updatedJoin,
        main_table: newTable,
        conditions,
      };

      dispatch(updateJoinNewTable(newTableWithJoin));
    }
  };

  const handleAddCondition = () => {
    let id = 0;

    if (join.conditions.length > 0) {
      id = join.conditions[join.conditions.length - 1].id + 1;
    }

    const condition: JoinConditionType = {
      id,
      main_column: '',
      main_table: {
        table_schema: '',
        table_name: '',
        table_alias: '',
        id: 0,
        table_type: '',
        columns: [],
        selectIndex: 0,
      },
      secondary_table: {
        table_schema: '',
        table_name: '',
        table_alias: '',
        id: 0,
        table_type: '',
        columns: [],
        selectIndex: 0,
      },
      secondary_column: '',
    };

    const conditions = [...join.conditions, condition];
    const updatedJoin = {
      ...join,
      conditions,
    };

    dispatch(updateJoin(updatedJoin));
  };

  const handleRemove = () => {
    dispatch(removeJoin(join));
  };

  const isTableSelected = _.isEmpty(join.main_table.table_name);

  let firstTable = '';
  if (tables.length) {
    firstTable =
      tables[0].table_alias === '' ? `${tables[0].table_schema}.${tables[0].table_name}` : `${tables[0].table_alias}`;
  }

  const getSelectedTableOption = (): SelectOption | null => {
    if (!join.main_table.table_name) return null;

    const table = join.main_table;
    const value = JSON.stringify(table);
    const label = table.table_alias.length > 0 ? `${table.table_name} (${table.table_alias})` : `${table.table_name}`;

    return { value, label };
  };

  return (
    <div className="my-2">
      <Draggable draggableId={id} index={index}>
        {(provided) => (
          <Card {...provided.draggableProps} {...provided.dragHandleProps} innerRef={provided.innerRef}>
            <CardBody className="py-2 px-0">
              <Form>
                <Container fluid>
                  <Row>
                    <div className="col-auto d-flex">
                      <FontAwesomeIcon className="align-self-center" icon="sort" />
                    </div>
                    <div className="col-10 px-0">
                      <Row form className="mb-2 align-items-center">
                        <div className="col-auto ">
                          <FontAwesomeIcon icon="link" style={{ color: join.color }} />
                        </div>
                        <div className="col-auto">
                          {index === 0 ? firstTable : translations[language.code].queryBuilder.joinResult}
                        </div>
                        <div className="col-auto">
                          <FormGroup className="m-0">
                            <CustomInput
                              bsSize="sm"
                              type="select"
                              id={`${id}_join_type`}
                              onChange={handleTypeChange}
                              value={join.type}
                            >
                              <option value="inner">INNER JOIN</option>
                              <option value="left">LEFT JOIN</option>
                              <option value="right">RIGHT JOIN</option>
                              <option value="outer">OUTER JOIN</option>
                              <option value="cross">CROSS JOIN</option>
                            </CustomInput>
                            <UncontrolledTooltip
                              placement="top"
                              delay={{ show: 500, hide: 0 }}
                              target={`${id}_join_type`}
                            >
                              {translations[language.code].tooltips.joinType}
                            </UncontrolledTooltip>
                          </FormGroup>
                        </div>
                        <div className="col-5">
                          <FormGroup className="m-0">
                            <Select
                              id="main_table"
                              placeholder={translations[language.code].queryBuilder.joinMainTable}
                              onChange={handleTableChange}
                              options={constructOptions()}
                              value={getSelectedTableOption()}
                            />
                          </FormGroup>
                        </div>
                      </Row>
                      <Row form>
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
                          {translations[language.code].queryBuilder.conditionH}
                        </div>
                      </Row>
                      {!_.isEmpty(join.conditions) && (
                        <Card className="mt-2">
                          <CardBody className="py-0 px-2">
                            {join.conditions.map((condition) => (
                              <JoinCondition
                                key={`join-${join.id}-condition-${condition.id}-query-${queryId}`}
                                condition={condition}
                                join={join}
                              />
                            ))}
                          </CardBody>
                        </Card>
                      )}
                    </div>
                    <div className="col-1 d-flex ml-auto pr-2 justify-content-end">
                      <FormGroup className="align-self-center m-0">
                        <Button size="sm" color="danger" onClick={handleRemove} id={`${id}_remove_join-${queryId}`}>
                          <FontAwesomeIcon icon="times" />
                        </Button>
                      </FormGroup>
                    </div>
                  </Row>
                </Container>
              </Form>
            </CardBody>
          </Card>
        )}
      </Draggable>
    </div>
  );
};

export default Join;
