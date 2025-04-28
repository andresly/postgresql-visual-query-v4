import { Button, NavLink } from 'reactstrap';
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { regenerateSql, setActiveQuery } from '../actions/queryActions';
import { updateQueries } from '../actions/queriesActions';
import DeleteQueryButton from './DeleteQueryButton';
import { useAppDispatch, useAppSelector } from '../hooks';
import { QueryType } from '../types/queryTypes';
import { setActiveTableView } from '../actions/tableViewActions';

interface NavBarQueryTabProps {
  queryTabContent: QueryType;
  queryName: string;
  active: boolean;
}

export const NavBarQueryTab: React.FC<NavBarQueryTabProps> = ({ queryTabContent, queryName, active }) => {
  const dispatch = useAppDispatch();
  const activeQuery = useAppSelector((state) => state.query);
  const queries = useAppSelector((state) => [...state.queries, state.query]);
  const activeQueryId = useAppSelector((state) => state.query.id);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent> | React.MouseEvent<any, MouseEvent>) => {
    e.preventDefault();

    const lastActiveQuery = queries.find((query) => query.id === activeQuery.id);

    if (lastActiveQuery) {
      dispatch(setActiveTableView(null));
      dispatch(setActiveQuery(queryTabContent));
      dispatch(updateQueries(lastActiveQuery, queryTabContent.id));
    }
    dispatch(regenerateSql());
  };

  const showDeleteBtn = () => activeQueryId === queryTabContent.id;

  return (
    <div className="pr-1 pt-1 pb-1">
      <Button
        value={queryName}
        className={active ? 'btn-sm btn-secondary shadow-none' : 'btn-sm btn-light btn-outline-secondary shadow-none'}
        onClick={handleClick}
        style={{ borderTopRightRadius: '0px', borderBottomRightRadius: '0px' }}
      >
        {queryTabContent.id === 0 && (
          <FontAwesomeIcon icon="home" size="1x" className="pr-2" style={{ width: '1.6rem' }} />
        )}
        <NavLink className="p-0 d-inline" style={{ color: active ? 'white' : '' }} onClick={handleClick}>
          {queryName}
        </NavLink>
      </Button>
      {showDeleteBtn() && <DeleteQueryButton queryId={queryTabContent.id} />}
    </div>
  );
};
