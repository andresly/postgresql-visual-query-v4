import React from 'react';
import { Input } from 'reactstrap';
import { useAppDispatch } from '../hooks';
import { updateColumn } from '../actions/queryActions';
import { QueryColumnType } from '../types/queryTypes';
import _ from 'lodash';

interface ValueInputProps {
  column: QueryColumnType;
  index: number;
  returningOnly: boolean;
}

export const ValueInput: React.FC<ValueInputProps> = ({ column, index, returningOnly }) => {
  const dispatch = useAppDispatch();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedColumn = _.cloneDeep(column);
    updatedColumn.column_values = column.column_values.map((value) =>
      value.id === parseInt(e.target.name, 10) ? { ...value, value: e.target.value } : value,
    );
    dispatch(updateColumn(updatedColumn));
  };

  return (
    <Input
      key={`column-value-${index}`}
      name={index.toString()}
      type="text"
      placeholder="NULL"
      defaultValue={column.column_values[index].value}
      onChange={handleChange}
      disabled={returningOnly}
    />
  );
};

export default ValueInput;
