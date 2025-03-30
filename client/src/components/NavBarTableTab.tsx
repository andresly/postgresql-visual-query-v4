import { Button, NavLink } from 'reactstrap';
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { setActiveTableView, closeTableView } from '../actions/tableViewActions';
import { useAppDispatch, useAppSelector } from '../hooks';
import { QueryTableType } from '../types/queryTypes';
import { changeQueryType } from '../actions/queryActions';

interface NavBarTableTabProps {
  table: QueryTableType;
  active: boolean;
}

export const NavBarTableTab: React.FC<NavBarTableTabProps> = ({ table, active }) => {
  const dispatch = useAppDispatch();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    dispatch(setActiveTableView(table.id));
  };

  const handleCloseClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    dispatch(closeTableView(table.id));
  };

  return (
    <div className="pr-1 pt-1 pb-1">
      <Button
        className={active ? 'btn-sm btn-secondary shadow-none' : 'btn-sm btn-light btn-outline-secondary shadow-none'}
        onClick={handleClick}
        style={{ borderTopRightRadius: '0px', borderBottomRightRadius: '0px' }}
      >
        <FontAwesomeIcon icon="table" size="1x" className="pr-2" style={{ width: '1.6rem' }} />
        <NavLink
          className="p-0 d-inline"
          active={active}
          style={{ color: active ? 'white' : '' }}
        >{`${table.table_name}`}</NavLink>
      </Button>
      <Button
        color="danger"
        size="sm"
        onClick={handleCloseClick}
        style={{ borderTopLeftRadius: '0px', borderBottomLeftRadius: '0px' }}
      >
        <FontAwesomeIcon icon="times" />
      </Button>
    </div>
  );
};

export default NavBarTableTab;
