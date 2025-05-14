import React from 'react';
import { Button, CustomInput, InputGroup, InputGroupAddon, InputGroupText, Row } from 'reactstrap';
import _ from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { updateJoin } from '../actions/queryActions';
import { translations } from '../utils/translations';
import { useAppSelector, useAppDispatch } from '../hooks';
import { JoinType, JoinConditionType } from '../types/queryTypes';

interface JoinConditionProps {
  join: JoinType;
  condition: JoinConditionType;
}

export const JoinCondition: React.FC<JoinConditionProps> = ({ join, condition }) => {
  const dispatch = useAppDispatch();
  const { tables, language } = useAppSelector((state) => ({
    tables: state.query.tables,
    language: state.settings.language,
  }));

  const handleMainColumnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    const value = JSON.parse(e.target.value);

    let updatedCondition = _.cloneDeep(condition);

    updatedCondition = {
      ...updatedCondition,
      main_column: value.column_name,
      main_table: join.main_table,
    };

    const conditions = _.cloneDeep(join.conditions);
    const conditionIndex = conditions.findIndex((_condition) => _condition.id === value.id);

    conditions[conditionIndex] = updatedCondition;

    let updatedJoin = _.cloneDeep(join);

    updatedJoin = {
      ...updatedJoin,
      conditions,
    };

    dispatch(updateJoin(updatedJoin));
  };

  const handleSecondaryTableChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    const value = JSON.parse(e.target.value);

    let updatedCondition = _.cloneDeep(condition);

    updatedCondition = {
      ...updatedCondition,
      secondary_table: value.table,
      secondary_column: '',
      main_table: join.main_table,
    };

    const conditions = _.cloneDeep(join.conditions);
    const conditionIndex = conditions.findIndex((_condition) => _condition.id === value.id);

    conditions[conditionIndex] = updatedCondition;

    let updatedJoin = _.cloneDeep(join);

    updatedJoin = {
      ...updatedJoin,
      conditions,
    };

    dispatch(updateJoin(updatedJoin));
  };

  const handleSecondaryColumnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    const value = JSON.parse(e.target.value);

    let updatedCondition = _.cloneDeep(condition);

    updatedCondition = {
      ...updatedCondition,
      secondary_column: value.column_name,
      main_table: join.main_table,
    };

    const conditions = _.cloneDeep(join.conditions);
    const conditionIndex = conditions.findIndex((_condition) => _condition.id === value.id);

    conditions[conditionIndex] = updatedCondition;

    let updatedJoin = _.cloneDeep(join);

    updatedJoin = {
      ...updatedJoin,
      conditions,
    };

    dispatch(updateJoin(updatedJoin));
  };

  const handleRemove = () => {
    let conditions = _.cloneDeep(join.conditions);

    conditions = conditions.filter((c) => c.id !== condition.id);

    let updatedJoin = _.cloneDeep(join);

    updatedJoin = {
      ...updatedJoin,
      conditions,
    };

    dispatch(updateJoin(updatedJoin));
  };

  const defaultValue = {
    id: condition.id,
    table: {
      table_schema: '',
      table_name: '',
      table_alias: '',
    },
  };

  const getSelectedMainColumnOption = () => {
    if (!condition.main_column) return '';

    const value = {
      id: condition.id,
      column_name: condition.main_column,
    };

    return JSON.stringify(value);
  };

  const getSelectedSecondaryTableOption = () => {
    if (!condition.secondary_table.table_name) {
      return JSON.stringify(defaultValue);
    }

    const secondaryTableOption = JSON.stringify({
      id: condition.id,
      table: condition.secondary_table,
    });

    return secondaryTableOption;
  };

  const getSelectedSecondaryColumnOption = () => {
    if (!condition.secondary_column) return '';

    const secondaryColumnOption = JSON.stringify({
      id: condition.id,
      column_name: condition.secondary_column,
    });
    return secondaryColumnOption;
  };

  return (
    <Row form className="my-2">
      <div className="col-auto">
        <InputGroup size="sm">
          <InputGroupAddon addonType="prepend">
            <InputGroupText>{join.main_table.table_name}</InputGroupText>
          </InputGroupAddon>
          <CustomInput
            type="select"
            id="main_table_columns"
            onChange={handleMainColumnChange}
            value={getSelectedMainColumnOption()}
          >
            <option key={`${condition.id}-main-column-null`} value="">
              {translations[language.code].queryBuilder.joinConditionMainColumn}
            </option>
            {join.main_table.columns.map((column: { column_name: string }) => {
              const value = {
                id: condition.id,
                column_name: column.column_name,
              };

              return (
                <option key={`${condition.id}-main-column-${column.column_name}`} value={JSON.stringify(value)}>
                  {column.column_name}
                </option>
              );
            })}
          </CustomInput>
        </InputGroup>
      </div>
      <div className="col-auto align-self-center">
        <FontAwesomeIcon icon="equals" size="xs" />
      </div>
      <div className="col-auto">
        <InputGroup size="sm">
          <CustomInput
            bsSize="sm"
            type="select"
            id="secondary_table"
            className="text-secondary"
            onChange={handleSecondaryTableChange}
            value={getSelectedSecondaryTableOption()}
          >
            <option key={`${condition.id}-secondary-table-null`} value={JSON.stringify(defaultValue)}>
              {translations[language.code].queryBuilder.joinConditionSecondaryTable}
            </option>
            {tables.map((table) => {
              const value = {
                id: condition.id,
                table,
              };
              const option =
                table.table_alias.length > 0 ? `${table.table_name} (${table.table_alias})` : `${table.table_name}`;

              return (
                join.main_table.id !== table.id && (
                  <option key={`${condition.id}-secondary-table-${table.id}`} value={JSON.stringify(value)}>
                    {option}
                  </option>
                )
              );
            })}
          </CustomInput>
          <CustomInput
            bsSize="sm"
            type="select"
            id="secondary_table_columns"
            className="text-secondary"
            onChange={handleSecondaryColumnChange}
            value={getSelectedSecondaryColumnOption()}
          >
            <option key={`${condition.id}-secondary-column-null`} value="">
              {translations[language.code].queryBuilder.joinConditionSecondaryColumn}
            </option>
            {!_.isEmpty(condition.secondary_table.table_name) &&
              condition.secondary_table.columns.map((column) => {
                const value = {
                  id: condition.id,
                  column_name: column.column_name,
                };

                return (
                  <option key={`${condition.id}-secondary-column-${column.column_name}`} value={JSON.stringify(value)}>
                    {column.column_name}
                  </option>
                );
              })}
          </CustomInput>
        </InputGroup>
      </div>
      <div className="col-auto ml-auto">
        <Button size="sm" color="danger" onClick={handleRemove}>
          <FontAwesomeIcon icon="times" />
        </Button>
      </div>
    </Row>
  );
};
