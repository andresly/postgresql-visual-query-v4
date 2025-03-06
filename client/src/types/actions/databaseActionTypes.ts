import {
  ADD_DATABASES,
  ADD_TABLES,
  ADD_COLUMNS,
  ADD_CONSTRAINTS,
  CHANGE_SELECTED_SCHEMA,
  UPDATE_SEARCH_EXPR,
  DELETE_DATABASE,
  UPDATE_HOST,
  CONNECT_ERROR,
  CONNECTED,
  CONNECTING,
} from '../../actions/databaseActions';
import { DatabaseTableType, DatabaseColumnType, DatabaseConstraintType } from '../databaseTypes';

export interface AddDatabasesAction {
  type: typeof ADD_DATABASES;
  payload: string[];
}

export interface AddTablesAction {
  type: typeof ADD_TABLES;
  payload: DatabaseTableType[];
}

export interface AddColumnsAction {
  type: typeof ADD_COLUMNS;
  payload: DatabaseColumnType[];
}

export interface AddConstraintsAction {
  type: typeof ADD_CONSTRAINTS;
  payload: DatabaseConstraintType[];
}

export interface ChangeSelectedSchemaAction {
  type: typeof CHANGE_SELECTED_SCHEMA;
  payload: string;
}

export interface UpdateSearchExprAction {
  type: typeof UPDATE_SEARCH_EXPR;
  payload: string;
}

export interface DeleteDatabaseAction {
  type: typeof DELETE_DATABASE;
}

export interface UpdateHostAction {
  type: typeof UPDATE_HOST;
  payload: {
    database?: string;
    user: string;
    password: string;
  };
}

export interface ConnectErrorAction {
  type: typeof CONNECT_ERROR;
  payload: string;
}

export interface ConnectedAction {
  type: typeof CONNECTED;
}

export interface ConnectingAction {
  type: typeof CONNECTING;
}

export type DatabaseActions =
  | AddDatabasesAction
  | AddTablesAction
  | AddColumnsAction
  | AddConstraintsAction
  | ChangeSelectedSchemaAction
  | UpdateSearchExprAction
  | DeleteDatabaseAction
  | UpdateHostAction
  | ConnectErrorAction
  | ConnectedAction
  | ConnectingAction;
