import React, { Fragment } from 'react';
import { NavBarQueryTab } from './NavBarQueryTab';
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

  return (
    <>
      {queries.map((query: QueryType, index: number) => (
        <Fragment key={`query-${query.id}`}>
          <NavBarQueryTab
            key={`query-${query.id}`}
            queryTabContent={query}
            queryName={getCorrectQueryName(language, query.queryName, query.id)}
            active={index === activeIndex}
          />
        </Fragment>
      ))}
    </>
  );
};

export default NavBarQueryTabs;
