import React from 'react';
import { Button } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { deleteQuery, setActiveQuery } from '../actions/queryActions';
import { deleteQueries, removeMainFromQueries } from '../actions/queriesActions';
import { useAppDispatch, useAppSelector } from '../hooks';
import { QueryType } from '../types/queryTypes';

const DeleteQueryButton: React.FC<{ queryId: number }> = ({ queryId }) => {
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

    sessionStorage.removeItem(`flow-state-${queryId}`);
  };

  return (
    <Button
      // color="danger"
      className="btn-sm close-button"
      onClick={handleOnClick}
      style={{
        borderTopLeftRadius: '0px',
        borderBottomLeftRadius: '0px',
        borderColor: '#6c757d',
        border: '1px solid #6c757d',
      }}
    >
      <FontAwesomeIcon icon="times" color={'#4c4c4c'} />
    </Button>
  );
};

export default DeleteQueryButton;
