import React, { useState } from 'react';
import { connect } from 'react-redux';
import {
  Button,
  CustomInput,
  Col,
  Form,
  Input,
  InputGroup,
  Row,
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { updateColumn, removeColumn } from '../actions/queryActions';

export const NewQueryColumn = (props) => {
  const [returning, setReturning] = useState(props.data.returning);

  const column = props.data;

  const handleChange = (e) => {
    column.column_filters.map((filter) => {
      if (filter.id === parseInt(e.target.name)) {
        filter.filter = e.target.value;
      }
      return filter;
    });
  };

  const handleSave = () => {
    props.updateColumn(column);
  };

  const handleRemoveColumn = () => {
    props.removeColumn(props.data);
  };

  const handleSwitch = () => {
    column.returning = !column.returning;
    setReturning(current => !current);

    props.updateColumn(column);
  };

  return (
    <div>
      <Form className="border border-secondary rounded mt-2 mb-2 p-3">
        <Row>
          <div className="col-sm-1 d-flex">
            <h6>
              {column.column_name}
            </h6>
          </div>
          <div>
            <InputGroup size="sm">
              <CustomInput
                className="mr-2"
                type="switch"
                id={`column-returning-${column.id}`}
                key={column.id}
                name="returning"
                disabled={props.returning}
                checked={returning}
                onChange={handleSwitch}
                label="Returning"
              />
              {column.column_filters.map((filter) => (
                <Col className="md-4" key={filter.id}>
                  <Input
                    id={`column-filter-${filter.id}`}
                    name={filter.id}
                    key={filter.id}
                    type="text"
                    placeholder="filter"
                    defaultValue={filter.filter}
                    onBlur={handleSave}
                    onChange={handleChange}
                  >
                  </Input>
                </Col>
              ))}
            </InputGroup>
          </div>
          <div>
            <Button
              className="ml-3"
              size="sm"
              color="danger"
              onClick={handleRemoveColumn}
            >
              <FontAwesomeIcon icon="times" />
            </Button>
          </div>
        </Row>
      </Form>
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

export default connect(mapStateToProps, mapDispatchToProps)(NewQueryColumn);
