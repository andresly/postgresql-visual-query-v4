import React, { useState, ChangeEvent } from 'react';
import { Input } from 'reactstrap';
import { updateColumnFilter } from '../actions/queryActions';
import { useAppDispatch } from '../hooks';

interface FilterInputProps {
  value: string;
  filterId: number;
  columnId: number;
  returningOnly: boolean;
}

const FilterInput: React.FC<FilterInputProps> = ({ value, filterId, columnId, returningOnly }) => {
  const [filterValue, setFilterValue] = useState<string>(value);
  const dispatch = useAppDispatch();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFilterValue(e.target.value);
  };

  const handleSave = () => {
    const data = {
      filterId,
      columnId,
      filter: filterValue,
    };
    dispatch(updateColumnFilter(data));
  };

  return (
    <Input
      id={`column-filter-${filterId}`}
      name={filterId.toString()}
      key={filterId}
      type="text"
      placeholder="Ex. = 3"
      value={filterValue}
      onBlur={handleSave}
      onChange={handleChange}
      disabled={returningOnly}
    />
  );
};

export default FilterInput;
