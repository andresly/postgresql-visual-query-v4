import React, { useState } from 'react';
import { CustomInput } from 'reactstrap';
import { updateColumn } from '../actions/queryActions';
import { useAppDispatch } from '../hooks';
import { QueryColumnType } from '../types/queryTypes';
import _ from 'lodash';

interface UpdateSwitchProps {
  column: QueryColumnType;
}

const UpdateSwitch: React.FC<UpdateSwitchProps> = ({ column }) => {
  const [enabled, setEnabled] = useState(column.value_enabled);
  const dispatch = useAppDispatch();

  const handleChange = () => {
    const updatedColumn = {
      ..._.cloneDeep(column),
      value_enabled: !column.value_enabled,
    };
    setEnabled(!enabled);
    dispatch(updateColumn(updatedColumn));
  };

  return (
    <CustomInput
      id={`column-value-switch-${column.id}`}
      name="valueSwitch"
      key={column.id}
      type="switch"
      defaultValue={enabled.toString()}
      checked={enabled}
      onChange={handleChange}
    />
  );
};

export default UpdateSwitch;
