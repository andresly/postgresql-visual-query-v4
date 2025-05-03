import React from 'react';
import { Button, Tooltip } from 'reactstrap';
import _ from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { addTable, resetQuery } from '../actions/queryActions';
import { openTableView, setActiveTableView } from '../actions/tableViewActions';
import { useAppDispatch } from '../hooks';
import { withToggle } from '../hocs/withToggle';
import { QueryTableType } from '../types/queryTypes';

interface DatabaseTableProps {
  data: QueryTableType;
  checked: boolean;
  id: string;
  toggle: () => void;
  toggleStatus: boolean;
  queryType: string;
}

export const DatabaseTable: React.FC<DatabaseTableProps> = ({ data, checked, id, toggle, toggleStatus, queryType }) => {
  const dispatch = useAppDispatch();

  const handleOnClick = () => {
    if (queryType === 'INSERT') {
      dispatch(resetQuery(queryType));
    }

    dispatch(addTable(data));
    dispatch(setActiveTableView(null));
  };

  const handleOpenNewTab = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(openTableView(data));
  };

  let tableTypeColor = 'primary';

  if (_.isEqual(data.table_type, 'VIEW')) {
    tableTypeColor = 'info';
  } else if (_.isEqual(data.table_type, 'FOREIGN')) {
    tableTypeColor = 'secondary';
  } else if (_.isEqual(data.table_type, 'MATERIALIZED VIEW')) {
    tableTypeColor = 'light';
  }

  const btnSelected = checked ? 'success' : tableTypeColor;

  const modifiers = {
    preventOverflow: {
      enabled: false,
    },
    hide: {
      enabled: false,
    },
  };

  return (
    <div className="w-100 pr-1 position-relative my-1 ">
      <Button
        size="sm"
        color={btnSelected}
        id={id}
        className="btn-block pt-0 text-left"
        style={{ paddingRight: '30px' }}
      >
        <div className="d-flex justify-content-between align-items-center">
          <div onClick={handleOnClick} className="w-100">
            <small color={tableTypeColor} className="text-truncate align-self-start">
              <span className="mr-1 px-0">
                <FontAwesomeIcon icon="th-large" />
              </span>
              {data.table_type}
            </small>
            <div className="text-truncate">{` ${data.table_name}`}</div>
          </div>
        </div>
      </Button>
      <Tooltip
        placement="right"
        isOpen={toggleStatus}
        target={id}
        toggle={toggle}
        modifiers={modifiers}
        delay={{ show: 200, hide: 0 }}
        className=""
      >
        {data.table_name}
      </Tooltip>
      <div className={'open-new-tab-btn'}>
        <FontAwesomeIcon
          icon={faExternalLinkAlt}
          style={{ width: '1rem', height: '1rem' }}
          color={'white'}
          onClick={handleOpenNewTab}
        />
      </div>
    </div>
  );
};

export default withToggle(DatabaseTable);
