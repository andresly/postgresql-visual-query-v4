import React, { Fragment } from 'react';
import { NavBarQueryTab } from './NavBarQueryTab';
import NavBarTableTab from './NavBarTableTab';
import { getCorrectQueryName } from '../utils/getCorrectQueryName';
import { useAppSelector } from '../hooks';
import { QueryType } from '../types/queryTypes';

export const NavBarQueryTabs = () => {
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
