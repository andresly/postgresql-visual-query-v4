import React, { Fragment } from 'react';
import { NavBarQueryTab } from './NavBarQueryTab';
import NavBarTableTab from './NavBarTableTab';
import { getCorrectQueryName } from '../utils/getCorrectQueryName';
import { useAppSelector, useAppDispatch } from '../hooks';
import { QueryType } from '../types/queryTypes';
import { addQuery } from '../actions/queriesActions';
import { translations } from '../utils/translations';

// Add hover effect style
const newQueryTabStyle = {
  cursor: 'pointer',
  background: 'transparent',
  fontSize: '0.9rem',
  fontWeight: 'normal',
  // color: '#007bff',
  outline: 'none',
  position: 'relative',
} as React.CSSProperties;

export const NavBarQueryTabs = () => {
  const dispatch = useAppDispatch();
  const { queries, activeIndex, language } = useAppSelector((state) => {
    const allQueries = [...state.queries, state.query]
      .slice()
      .sort((query1: QueryType, query2: QueryType) => query1.id - query2.id);
    const currentActiveIndex = allQueries.findIndex((query) => query.id === state.query.id);

    return {
      queries: allQueries,
      activeIndex: currentActiveIndex,
      language: state.settings.language,
    };
  });

  // Get table tabs from tableView reducer
  const { tables, activeTableId } = useAppSelector((state) => state.tableView);

  const handleAddQuery = () => {
    dispatch(addQuery(queries[activeIndex].id));
  };

  return (
    <>
      {/* Query Tabs */}
      {queries.map((query: QueryType, index: number) => (
        <Fragment key={`query-${query.id}`}>
          <NavBarQueryTab
            queryTabContent={query}
            queryName={getCorrectQueryName(language, query.queryName, query.id)}
            active={index === activeIndex && activeTableId === null}
          />
        </Fragment>
      ))}

      {/* New Query Tab */}
      <button
        type="button"
        className="nav-item nav-link text-nowrap px-2 py-1 border-0 new-query-tab"
        style={newQueryTabStyle}
        onClick={handleAddQuery}
      >
        <strong>+ {translations[language.code]?.queryBuilder?.queryH || 'New query'}</strong>
      </button>

      {/* Table Tabs */}
      {tables.map((table) => (
        <Fragment key={`table-${table.id}`}>
          <NavBarTableTab table={table} active={table.id === activeTableId} />
        </Fragment>
      ))}
    </>
  );
};

export default NavBarQueryTabs;
