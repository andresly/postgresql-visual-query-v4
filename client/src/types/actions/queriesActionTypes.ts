import { ADD_QUERY, COPY_QUERY, REMOVE_MAIN_FROM_QUERIES, UPDATE_QUERIES } from '../../actions/queriesActions';
import { QueryType } from '../queryTypes';
import { DELETE_QUERIES } from '../../actions/hostActions';

export interface AddQueryAction {
  type: typeof ADD_QUERY;
  payload: {
    activeQueryId: number;
  };
}

export interface CopyQueryAction {
  type: typeof COPY_QUERY;
  payload: {
    sourceQuery: QueryType;
  };
}

export interface updateQueriesAction {
  type: typeof UPDATE_QUERIES;
  payload: {
    lastQuery: QueryType;
    activeQueryId: number;
  };
}

export interface DeleteQueriesAction {
  type: typeof DELETE_QUERIES;
  // no payload
}

export type RemoveMainFromQueriesAction = {
  type: typeof REMOVE_MAIN_FROM_QUERIES;
  // no payload
};

export type QueriesActions =
  | AddQueryAction
  | CopyQueryAction
  | updateQueriesAction
  | DeleteQueriesAction
  | RemoveMainFromQueriesAction;
