import React from 'react';
import { Button, Tooltip } from 'reactstrap';
import { connect } from 'react-redux';
import _ from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import * as PropTypes from 'prop-types';
import { addColumn, addTable, removeTable, resetQuery } from '../actions/queryActions';
import { withToggle } from '../hocs/withToggle';

export const DatabaseTable = ({ data, checked, id, addTableProp, toggle, toggleStatus, queryType, resetQuery }) => {
  const handleOnClick = () => {
    if (queryType === 'INSERT') {
      resetQuery(queryType);
    }

    addTableProp(data);
  };

  const handleOpenNewTab = (e) => {
    e.preventDefault();
    window.open(data.table_name, '_blank');
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
    <div className="w-100 pr-1">
      <Button size="sm" color={btnSelected} id={id} className="btn-block my-1 pt-0 text-left">
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
          <div>
            <FontAwesomeIcon
              icon={faExternalLinkAlt}
              style={{ width: '1rem', height: '1rem' }}
              onClick={handleOpenNewTab}
            />
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
    </div>
  );
};

DatabaseTable.propTypes = {
  data: PropTypes.shape({ table_type: PropTypes.string, table_name: PropTypes.string }),
  checked: PropTypes.bool,
  id: PropTypes.string,
  addTableProp: PropTypes.func,
  toggle: PropTypes.func,
  toggleStatus: PropTypes.bool,
  queryType: PropTypes.string,
};

const mapDispatchToProps = {
  addColumn,
  addTableProp: (data) => addTable(data),
  removeTable,
  resetQuery,
};

export default withToggle(connect(null, mapDispatchToProps)(DatabaseTable));
