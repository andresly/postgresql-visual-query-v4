import React, { useState } from 'react';
import { connect } from 'react-redux';
import {
  CustomInput,
} from 'reactstrap';
import { updateColumn } from '../actions/queryActions';

export const UpdateSwitch = (props) => {
  const [enabled, setEnabled] = useState(props.column.value_enabled);
  const { column } = props;

  const handleChange = () => {
    column.value_enabled = !column.value_enabled;
    setEnabled(current => !current);
    props.updateColumn(column);
  };

  return (
    <CustomInput
      id={`column-value-switch-${column.id}`}
      name="valueSwitch"
      key={column.id}
      type="switch"
      defaultValue={enabled}
      checked={enabled}
      onChange={handleChange}
    />
  );
};

const mapDispatchToProps = {
  updateColumn,
};

export default connect(null, mapDispatchToProps)(UpdateSwitch);
