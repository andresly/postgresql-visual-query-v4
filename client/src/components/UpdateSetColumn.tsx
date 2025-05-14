import React from 'react';
import { Input } from 'reactstrap';
import _ from 'lodash';
import { useAppDispatch } from '../hooks';
import { updateColumn } from '../actions/queryActions';
import { QueryColumnType } from '../types/queryTypes';

interface UpdateSetColumnProps {
  column: QueryColumnType;
  enabled: boolean;
}

const UpdateSetColumn: React.FC<UpdateSetColumnProps> = ({ column, enabled }) => {
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
      id={`column-update-set-${column.id}`}
      name="column_update_set"
      key={column.id}
      type="text"
      placeholder="Value"
      defaultValue={column.column_value || ''}
      onChange={handleChange}
      disabled={!enabled}
    />
  );
};

export default UpdateSetColumn;
