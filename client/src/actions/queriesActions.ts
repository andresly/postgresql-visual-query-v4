import { QueryType } from '../types/queryTypes';

export const ADD_QUERY = 'ADD_QUERY';
export const UPDATE_QUERIES = 'UPDATE_QUERIES';
export const REMOVE_MAIN_FROM_QUERIES = 'REMOVE_MAIN_FROM_QUERIES';
export const DELETE_QUERIES = 'DELETE_QUERIES';
export const COPY_QUERY = 'COPY_QUERY';

export const addQuery = (activeQueryId: number) => ({ type: ADD_QUERY, payload: { activeQueryId } });

export const copyQuery = (sourceQuery: QueryType) => ({
  type: COPY_QUERY,
  payload: { sourceQuery },
});

export const updateQueries = (lastQuery: QueryType, activeQueryId: number) => ({
  type: UPDATE_QUERIES,
  payload: { lastQuery, activeQueryId },
});

export const deleteQueries = () => ({ type: DELETE_QUERIES });

export const removeMainFromQueries = () => ({ type: REMOVE_MAIN_FROM_QUERIES });
