import React from 'react';
import { Button } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { removeColumn } from '../actions/queryActions';
import { useAppDispatch } from '../hooks';
import { QueryColumnType } from '../types/queryTypes';

interface RemoveColumnButtonProps {
  column: QueryColumnType;
}

export const RemoveColumnButton: React.FC<RemoveColumnButtonProps> = ({ column }) => {
  const dispatch = useAppDispatch();

  const handleRemoveColumn = () => {
    dispatch(removeColumn(column));
  };

  return (
    <Button
      className="mr-2 float-right"
      name={column.id.toString()}
      size="sm"
      color="danger"
      onClick={handleRemoveColumn}
    >
      <FontAwesomeIcon icon="times" />
    </Button>
  );
};

export default RemoveColumnButton;
