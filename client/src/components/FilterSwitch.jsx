import React, { useState } from 'react';
import { connect } from 'react-redux';
import {
  CustomInput,
} from 'reactstrap';
import { updateColumn } from '../actions/queryActions';

export const FilterSwitch = (props) => {
  const [returning, setReturning] = useState(props.column.returning);
  const [returningOnly, setReturningOnly] = useState(props.column.returningOnly);

  const { column } = props;

  const handleChange = () => {
    if (props.only) {
      column.returningOnly = !column.returningOnly;
      setReturningOnly(current => !current);
      props.updateColumn(column);
    } else {
      column.returning = !column.returning;
      setReturning(current => !current);
      props.updateColumn(column);
    }
  };

  return (
    <CustomInput
      id={`column-${props.only ? 'returningOnly' : 'returning'}-${column.id}`}
      name={(props.only ? 'returningOnly' : 'returning')}
      key={column.id}
      type="switch"
      defaultValue={(props.only ? returningOnly : returning)}
      checked={(props.only ? returningOnly : returning)}
      disabled={props.only ? false : props.returningAll}
      onChange={handleChange}
    />
  );
};

const mapDispatchToProps = {
  updateColumn,
};

const mapStateToProps = (store) => ({
  returningAll: store.query.returning,
});

export default connect(mapStateToProps, mapDispatchToProps)(FilterSwitch);
