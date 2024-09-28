import { Button, NavLink } from 'reactstrap';
import React from 'react';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as PropTypes from 'prop-types';
import { setActiveQuery } from '../actions/queryActions';
import { updateQueries } from '../actions/queriesActions';
import DeleteQueryButton from './DeleteQueryButton';

export const NavBarQueryTab = (props) => {
  const handleClick = (e) => {
    e.preventDefault();

    const lastActiveQuery = props.queries.find(query => query.id === props.activeQuery.id);

    props.setActiveQuery(props.queryTabContent);
    props.updateQueries(lastActiveQuery, props.queryTabContent.id);
  };

  const showDeleteBtn = () => (props.activeQueryId === props.queryTabContent.id);

  return (
    <div className="pr-1 pt-1 pb-1">
      <Button
        value={props.queryName}
        className={props.active ? 'btn-sm btn-secondary shadow-none' : 'btn-sm btn-light btn-outline-secondary shadow-none'}
        onClick={handleClick}
        style={{ borderTopRightRadius: '0px', borderBottomRightRadius: '0px' }}
      >
        {props.queryTabContent.id === 0 && (
          <FontAwesomeIcon
            icon="home"
            size="1x"
            className="pr-2"
            style={{ width: '1.6rem' }}
          />
        )}
        <NavLink className="p-0 d-inline">{props.queryName}</NavLink>
      </Button>
      {showDeleteBtn() && <DeleteQueryButton />}
    </div>
  );
};

NavBarQueryTab.propTypes = {
  language: PropTypes.shape({ code: PropTypes.string }),
  queries: PropTypes.arrayOf(PropTypes.shape({})),
  activeQuery: PropTypes.shape({ id: PropTypes.number }),
  queryTabContent: PropTypes.shape({ id: PropTypes.number }),
  updateQueries: PropTypes.func,
  setActiveQuery: PropTypes.func,
  queryName: PropTypes.string,
  active: PropTypes.bool,
  activeQueryId: PropTypes.number,
};

const mapStateToProps = (store) => {
  const queries = [...store.queries, store.query];

  return ({
    activeQuery: store.query,
    queries,
    activeQueryId: store.query.id,
  });
};

const mapDispatchToProps = {
  setActiveQuery,
  updateQueries,
};

export default connect(mapStateToProps, mapDispatchToProps)(NavBarQueryTab);
