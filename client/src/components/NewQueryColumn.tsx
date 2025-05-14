import React, { useState } from 'react';
import { Button, CustomInput, Col, Form, Input, InputGroup, Row } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { updateColumn, removeColumn } from '../actions/queryActions';
import { useAppSelector, useAppDispatch } from '../hooks';
import { QueryColumnType } from '../types/queryTypes';

interface NewQueryColumnProps {
  data: QueryColumnType;
}

export const NewQueryColumn: React.FC<NewQueryColumnProps> = ({ data }) => {
  const [returning, setReturning] = useState(data.returning);
  const dispatch = useAppDispatch();
  const returningAll = useAppSelector((state) => state.query.returning);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    data.column_filters = data.column_filters.map((filter) => {
      if (filter.id === parseInt(e.target.name, 10)) {
        return { ...filter, filter: e.target.value };
      }
      return filter;
    });
  };

  const handleSave = () => {
    dispatch(updateColumn(data));
  };

  const handleRemoveColumn = () => {
    dispatch(removeColumn(data));
  };

  const handleSwitch = () => {
    data.returning = !data.returning;
    setReturning((current) => !current);
    dispatch(updateColumn(data));
  };

  return (
    <div>
      <Form className="border border-secondary rounded mt-2 mb-2 p-3">
        <Row>
          <div className="col-sm-1 d-flex">
            <h6>{data.column_name}</h6>
          </div>
          <div>
            <InputGroup size="sm">
              <CustomInput
                className="mr-2"
                type="switch"
                id={`column-returning-${data.id}`}
                key={data.id}
                name="returning"
                disabled={returningAll}
                checked={returning}
                onChange={handleSwitch}
                label="Returning"
              />
              {data.column_filters.map((filter) => (
                <Col className="md-4" key={filter.id}>
                  <Input
                    id={`column-filter-${filter.id}`}
                    name={filter.id.toString()}
                    key={filter.id}
                    type="text"
                    placeholder="filter"
                    defaultValue={filter.filter}
                    onBlur={handleSave}
                    onChange={handleChange}
                  />
                </Col>
              ))}
            </InputGroup>
          </div>
          <div>
            <Button className="ml-3" size="sm" color="danger" onClick={handleRemoveColumn}>
              <FontAwesomeIcon icon="times" />
            </Button>
          </div>
        </Row>
      </Form>
    </div>
  );
};

export default NewQueryColumn;
