import React from 'react';
import { Button } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { deleteQuery, setActiveQuery } from '../actions/queryActions';
import { deleteQueries, removeMainFromQueries } from '../actions/queriesActions';
import { useAppDispatch, useAppSelector } from '../hooks';
import { QueryType } from '../types/queryTypes';

const DeleteQueryButton: React.FC = () => {
  const dispatch = useAppDispatch();
  const queries = useAppSelector((state) => state.queries);

  const handleOnClick = () => {
    dispatch(deleteQuery());

    const mainQuery = queries.find((query: QueryType) => query.id === 0);

    if (mainQuery) {
      dispatch(removeMainFromQueries());
      dispatch(setActiveQuery(mainQuery));
    } else {
      dispatch(deleteQueries());
    }
  };

  return (
    <Button
      color="danger"
      className="btn-sm"
      onClick={handleOnClick}
      style={{ borderTopLeftRadius: '0px', borderBottomLeftRadius: '0px' }}
    >
      <FontAwesomeIcon icon="times" />
    </Button>
  );
};

export default DeleteQueryButton;
