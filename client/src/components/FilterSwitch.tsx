import React, { useState } from 'react';
import { CustomInput } from 'reactstrap';
import { updateColumn } from '../actions/queryActions';
import { useAppSelector, useAppDispatch } from '../hooks';
import { QueryColumnType } from '../types/queryTypes';

interface FilterSwitchProps {
  column: QueryColumnType;
  only: boolean;
}

const FilterSwitch: React.FC<FilterSwitchProps> = ({ column, only }) => {
  const [returning, setReturning] = useState(column.returning);
  const [returningOnly, setReturningOnly] = useState(column.returningOnly);
  const returningAll = useAppSelector((state) => state.query.returning);
  const dispatch = useAppDispatch();

  const handleChange = () => {
    if (only) {
      column.returningOnly = !column.returningOnly;
      setReturningOnly((current) => !current);
      dispatch(updateColumn(column));
    } else {
      column.returning = !column.returning;
      setReturning((current) => !current);
      dispatch(updateColumn(column));
    }
  };

  return (
    <CustomInput
      id={`column-${only ? 'returningOnly' : 'returning'}-${column.id}`}
      name={only ? 'returningOnly' : 'returning'}
      key={column.id}
      type="switch"
      checked={only ? returningOnly : returning}
      disabled={only ? false : returningAll}
      onChange={handleChange}
    />
  );
};

export default FilterSwitch;
