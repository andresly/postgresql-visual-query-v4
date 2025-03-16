import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Button, CustomInput, Col, Input, InputGroup, Row } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { updateColumn, removeColumn } from '../actions/queryActions';

export const DeleteQueryColumn = (props) => {
  const [returning, setReturning] = useState(props.data.returning);
  const [returningOnly, setReturningOnly] = useState(props.data.returning);

  const column = props.data;

  const handleChange = (e) => {
    column.column_filters.map((filter) => {
      if (filter.id === parseInt(e.target.name, 10)) {
        filter.filter = e.target.value;
      }
      return filter;
    });
  };

  const handleSave = () => {
    props.updateColumn({ column });
  };

  const handleRemoveColumn = () => {
    props.removeColumn(props.data);
  };

  const handleReturningSwitch = () => {
    column.returning = !column.returning;
    setReturning((current) => !current);

    props.updateColumn({ column });
  };

  const handleReturningOnlySwitch = () => {
    column.returningOnly = !column.returningOnly;
    setReturningOnly((current) => !current);

    props.updateColumn({ column });
  };

  return (
    <div>
      <div className="border-bottom border-right pr-2 pl-1 border-dark">
        <h6 className="d-inline">
          {column.table_name}.{column.column_name}
        </h6>
        <Button className="mr-2 float-right" size="sm" color="danger" onClick={handleRemoveColumn}>
          <FontAwesomeIcon icon="times" />
        </Button>
        <InputGroup size="sm">
          <CustomInput
            className=""
            type="switch"
            id={`column-returning-${column.id}`}
            key={column.id}
            name="returning"
            disabled={props.returning || returningOnly}
            checked={returning}
            onChange={handleReturningSwitch}
            label="Returning"
          />
          <CustomInput
            className=""
            type="switch"
            id={`column-returning-only-${column.id}`}
            key={column.id}
            name="returning-only"
            disabled={props.returning}
            checked={returningOnly}
            onChange={handleReturningOnlySwitch}
            label="Returning only"
          />
        </InputGroup>
      </div>
      <Col className="mr-2 border-bottom">
        {column.column_filters.map((filter) => (
          <Row className="pt-2 pb-2 pr-2 pl-1 border-top" key={filter.id}>
            <Input
              id={`column-filter-${filter.id}`}
              name={filter.id}
              key={filter.id}
              type="text"
              placeholder="Ex. = 3"
              defaultValue={filter.filter}
              onBlur={handleSave}
              onChange={handleChange}
              disabled={returningOnly}
            />
            <p className="ml-2">AND</p>
          </Row>
        ))}
      </Col>
    </div>
  );
};

const mapStateToProps = (store) => ({
  returning: store.query.returning,
});

const mapDispatchToProps = {
  updateColumn,
  removeColumn,
};

export default connect(mapStateToProps, mapDispatchToProps)(DeleteQueryColumn);
