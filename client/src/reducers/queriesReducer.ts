import _ from 'lodash';
import {
  ADD_QUERY,
  COPY_QUERY,
  DELETE_QUERIES,
  REMOVE_MAIN_FROM_QUERIES,
  UPDATE_QUERIES,
} from '../actions/queriesActions';
import { INITIAL_STATE } from './queryReducer';
import { Reducer } from 'redux';
import { QueryType } from '../types/queryTypes';
import { QueriesActions } from '../types/actions/queriesActionTypes';

const INIT_QUERIES_STATE = _.cloneDeep(INITIAL_STATE);

export const queriesReducer: Reducer<QueryType[], QueriesActions> = (state = [], action) => {
  switch (action.type) {
    case ADD_QUERY: {
      let id;

      if (state.length) {
        const allQueries = [...state, { id: action.payload.activeQueryId }];
        const maxId = Math.max(...allQueries.map((query) => query.id));

        id = maxId + 1;
      } else {
        id = 1;
      }

      const query = {
        ...INIT_QUERIES_STATE,
        id,
        queryName: id === 0 ? 'Main' : `Query ${id}`,
      };

      return [...state, query];
    }
    case COPY_QUERY: {
      let id;

      const allQueries = [...state, action.payload.sourceQuery];
      // Get all existing queries and compute next available ID
      const allIds = allQueries.map((query) => query.id);
      const maxId = Math.max(...allIds);
      id = maxId + 1;

      // Create a completely new query with a deep clone of the source
      const sourceQuery = _.cloneDeep(action.payload.sourceQuery);

      // Ensure we create a new object with a different ID and name
      const newQuery = {
        ..._.cloneDeep(INIT_QUERIES_STATE), // Start with a clean base state
        ...sourceQuery, // Apply source properties
        id, // Override with new ID
        queryName: `Query ${id}`, // Override with new name
      };

      // Ensure we keep ALL existing queries intact and just add the new one
      return [...state, newQuery];
    }
    case UPDATE_QUERIES: {
      const lastActiveQuery = _.cloneDeep(action.payload.lastQuery);
      const filteredState = state.filter((query) => query.id !== lastActiveQuery.id);
      const newQueriesState = [...filteredState, lastActiveQuery].filter(
        (query) => query.id !== action.payload.activeQueryId,
      );

      return newQueriesState;
    }
    case REMOVE_MAIN_FROM_QUERIES: {
      const queriesState = _.cloneDeep(state);
      const queries = queriesState.filter((query) => query.id !== 0);

      return [...queries];
    }
    case DELETE_QUERIES: {
      return [];
    }
    default:
      return state;
  }
};
