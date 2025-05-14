import React from 'react';
import { Input } from 'reactstrap';
import { useAppDispatch } from '../hooks';
import { updateColumn } from '../actions/queryActions';
import { QueryColumnType } from '../types/queryTypes';
import _ from 'lodash';

interface SetInputProps {
  column: QueryColumnType;
  enabled: boolean;
}

export const SetInput: React.FC<SetInputProps> = ({ column, enabled }) => {
  const dispatch = useAppDispatch();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedColumn = {
      ..._.cloneDeep(column),
      column_value: e.target.value,
    };
    dispatch(updateColumn(updatedColumn));
  };

  return (
    <Input
      id={`column-set-${column.id}`}
      name="column_set"
      key={column.id}
      type="text"
      placeholder="NULL"
      defaultValue=""
      onChange={handleChange}
      disabled={!enabled}
    />
  );
};

export default SetInput;
