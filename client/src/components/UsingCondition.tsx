import React from 'react';
import { Button, CustomInput, InputGroup, InputGroupAddon, InputGroupText, Row } from 'reactstrap';
import _ from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { updateUsing } from '../actions/queryActions';
import { translations } from '../utils/translations';
import { useAppSelector, useAppDispatch } from '../hooks';
import { LanguageType } from '../types/settingsType';
import { UsingType, UsingCondition as UsingConditionType } from '../types/queryTypes';

interface UsingConditionProps {
  id?: string;
  using: UsingType;
  condition: UsingConditionType;
}

interface ColumnValue {
  id: number;
  column_name: string;
}

export const UsingCondition: React.FC<UsingConditionProps> = ({ using, condition }) => {
  const dispatch = useAppDispatch();
  const tables = useAppSelector((state) => state.query.tables);
  const language = useAppSelector((state) => state.settings.language) as LanguageType;

  const handleMainColumnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    const value: ColumnValue = JSON.parse(e.target.value);

    const updatedCondition = {
      ..._.cloneDeep(condition),
      main_column: value.column_name,
    };

    const conditions = _.cloneDeep(using.conditions);
    const conditionIndex = conditions.findIndex((_condition) => _condition.id === condition.id);

    conditions[conditionIndex] = updatedCondition;

    const updatedUsing = {
      ..._.cloneDeep(using),
      conditions,
    };

    const data = {
      using: updatedUsing,
      newTable: false,
    };

    dispatch(updateUsing(data));
  };

  const handleSecondaryColumnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    const value: ColumnValue = JSON.parse(e.target.value);

    const secondaryTable = {
      table_alias: '',
      table_name: tables[0].table_name,
      table_schema: '',
    };

    const updatedCondition = {
      ..._.cloneDeep(condition),
      secondary_column: value.column_name,
      secondary_table: secondaryTable,
    };

    const conditions = _.cloneDeep(using.conditions);
    const conditionIndex = conditions.findIndex((_condition) => _condition.id === condition.id);

    conditions[conditionIndex] = updatedCondition;

    const updatedUsing = {
      ..._.cloneDeep(using),
      conditions,
    };

    const data = {
      using: updatedUsing,
      newTable: false,
    };

    dispatch(updateUsing(data));
  };

  const handleRemove = () => {
    let conditions = _.cloneDeep(using.conditions);

    conditions = conditions.filter((_condition) => _condition.id !== condition.id);

    const updatedUsing = {
      ..._.cloneDeep(using),
      conditions,
    };

    const data = {
      using: updatedUsing,
      newTable: false,
    };

    dispatch(updateUsing(data));
  };

  return (
    <Row form className="my-2">
      <div className="col-auto">
        <InputGroup size="sm">
          <InputGroupAddon addonType="prepend">
            <InputGroupText>{using.main_table.table_name}</InputGroupText>
          </InputGroupAddon>
          <CustomInput type="select" id="main_table_columns" onChange={handleMainColumnChange} defaultValue="">
            <option key={`${condition.id}-main-column-null`} value="">
              {translations[language.code].queryBuilder.joinConditionMainColumn}
            </option>
            {using.main_table.columns?.map((column) => {
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
          <InputGroupAddon addonType="prepend">
            <InputGroupText>{tables[0].table_name}</InputGroupText>
          </InputGroupAddon>
          <CustomInput
            bsSize="sm"
            type="select"
            id="secondary_table_columns"
            className="text-secondary"
            onChange={handleSecondaryColumnChange}
            defaultValue=""
          >
            <option key={`${condition.id}-secondary-column-null`} value="">
              {translations[language.code].queryBuilder.joinConditionSecondaryColumn}
            </option>
            {tables[0].columns?.map((column) => {
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

export default UsingCondition;
