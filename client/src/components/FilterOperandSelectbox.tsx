import { CustomInput, Row } from 'reactstrap';
import React, { useEffect, useState, ChangeEvent } from 'react';
import { updateColumnOperand } from '../actions/queryActions';
import { useAppDispatch } from '../hooks';
import { QueryColumnType } from '../types/queryTypes';

interface FilterOperandSelectboxProps {
  column: Pick<QueryColumnType, 'id'>;
}

const FilterOperandSelectbox: React.FC<FilterOperandSelectboxProps> = ({ column }) => {
  const dispatch = useAppDispatch();
  const [filterOperand, setFilterOperand] = useState('AND');

  useEffect(() => {
    dispatch(updateColumnOperand(filterOperand, column.id));
  }, [filterOperand, column.id, dispatch]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFilterOperand(e.target.value);
  };

  return (
    <Row form className="mb-2">
      <div className="ml-3">
        <CustomInput
          bsSize="sm"
          type="select"
          key={column.id}
          id="column_filter_operand"
          value={filterOperand}
          onChange={handleChange}
        >
          <option value="AND">AND</option>
          <option value="OR">OR</option>
          <option value="AND NOT">AND NOT</option>
          <option value="OR NOT">OR NOT</option>
        </CustomInput>
      </div>
    </Row>
  );
};

export default FilterOperandSelectbox;
