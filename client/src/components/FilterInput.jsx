import React from 'react';
import { connect } from 'react-redux';
import {
  Input,
} from 'reactstrap';
import { updateColumnFilter } from '../actions/queryActions';

export const FilterInput = (props) => {
  let filterValue = props.value;

  const handleChange = (e) => {
    filterValue = e.target.value;
  };

  const handleSave = () => {
    const data = {
      filterId: props.filterId,
      columnId: props.columnId,
      filter: filterValue,
    };
    props.updateColumnFilter(data);
  };

  return (
    <Input
      id={`column-filter-${props.filterId}`}
      name={props.filterId}
      key={props.filterId}
      type="text"
      placeholder="Ex. = 3"
      defaultValue={props.value}
      onBlur={handleSave}
      onChange={handleChange}
      disabled={props.returningOnly}
    />
  );
};

const mapDispatchToProps = {
  updateColumnFilter,
};

export default connect(null, mapDispatchToProps)(FilterInput);
