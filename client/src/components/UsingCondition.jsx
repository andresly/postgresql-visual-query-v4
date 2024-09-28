import React from 'react';
import { Button, CustomInput, InputGroup, InputGroupAddon, InputGroupText, Row } from 'reactstrap';
import _ from 'lodash';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as PropTypes from 'prop-types';
import { updateUsing } from '../actions/queryActions';
import { translations } from '../utils/translations';

export const UsingCondition = (props) => {
  const handleMainColumnChange = (e) => {
    e.preventDefault();

    const value = JSON.parse(e.target.value);

    let condition = _.cloneDeep(props.condition);

    condition = {
      ...condition,
      main_column: value.column_name,
    };

    const conditions = _.cloneDeep(props.using.conditions);
    const conditionIndex = conditions.findIndex(_condition => _condition.id === value.id);

    conditions[conditionIndex] = condition;

    let using = _.cloneDeep(props.using);

    using = {
      ...using,
      conditions,
    };

    const data = {
      using,
      newTable: false,
    };

    props.updateUsing(data);
  };

  const handleSecondaryColumnChange = (e) => {
    e.preventDefault();

    const value = JSON.parse(e.target.value);

    let condition = _.cloneDeep(props.condition);

    const secondaryTable = {
      table_alias: '',
      table_name: props.tables[0].table_name,
      table_schema: '',
    };

    condition = {
      ...condition,
      secondary_column: value.column_name,
      secondary_table: secondaryTable,
    };

    const conditions = _.cloneDeep(props.using.conditions);
    const conditionIndex = conditions.findIndex(_condition => _condition.id === value.id);

    conditions[conditionIndex] = condition;

    let using = _.cloneDeep(props.using);

    using = {
      ...using,
      conditions,
    };

    const data = {
      using,
      newTable: false,
    };

    props.updateUsing(data);
  };

  const handleRemove = () => {
    let conditions = _.cloneDeep(props.using.conditions);

    conditions = conditions.filter(condition => condition.id !== props.condition.id);

    let using = _.cloneDeep(props.using);

    using = {
      ...using,
      conditions,
    };

    const data = {
      using,
      newTable: false,
    };

    props.updateUsing(data);
  };

  return (
    <Row form className="my-2">
      <div className="col-auto">
        <InputGroup size="sm">
          <InputGroupAddon addonType="prepend">
            <InputGroupText>{props.using.main_table.table_name}</InputGroupText>
          </InputGroupAddon>
          <CustomInput
            type="select"
            id="main_table_columns"
            onChange={handleMainColumnChange}
            defaultValue=""
          >
            <option
              key={`${props.condition.id}-main-column-null`}
              value=""
            >
              {translations[props.language.code].queryBuilder.joinConditionMainColumn}
            </option>
            {props.using.main_table.columns.map((column) => {
              const value = {
                id: props.condition.id,
                column_name: column.column_name,
              };

              return (
                <option
                  key={`${props.condition.id}-main-column-${column.column_name}`}
                  value={JSON.stringify(value)}
                >
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
            <InputGroupText>{props.tables[0].table_name}</InputGroupText>
          </InputGroupAddon>
          <CustomInput
            bsSize="sm"
            type="select"
            id="secondary_table_columns"
            className="text-secondary"
            onChange={handleSecondaryColumnChange}
            defaultValue=""
          >
            <option key={`${props.condition.id}-secondary-column-null`} value="">
              {translations[props.language.code].queryBuilder.joinConditionSecondaryColumn}
            </option>
            {props.tables[0].columns.map((column) => {
              const value = {
                id: props.condition.id,
                column_name: column.column_name,
              };

              return (
                <option
                  key={`${props.condition.id}-secondary-column-${column.column_name}`}
                  value={JSON.stringify(value)}
                >
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

UsingCondition.propTypes = {
  id: PropTypes.string,
  language: PropTypes.shape({ code: PropTypes.string }),
  using: PropTypes.shape({
    id: PropTypes.number,
    conditions: PropTypes.arrayOf(PropTypes.shape([])),
    main_table: PropTypes.shape({
      table_name: PropTypes.string,
      id: PropTypes.number,
      columns: PropTypes.arrayOf(PropTypes.shape({})),
    }),
  }),
  condition: PropTypes.shape({
    id: PropTypes.number,
    secondary_table: PropTypes.shape({
      table_name: PropTypes.string,
      columns: PropTypes.arrayOf(PropTypes.shape({})),
    }),
  }),
  tables: PropTypes.arrayOf(PropTypes.shape({
    table_alias: PropTypes.string,
    table_name: PropTypes.string,
    table_schema: PropTypes.string,
  })),
};

const mapStateToProps = store => ({
  tables: store.query.tables,
  language: store.settings.language,
});

const mapDispatchToProps = {
  updateUsing,
};

export default connect(mapStateToProps, mapDispatchToProps)(UsingCondition);
