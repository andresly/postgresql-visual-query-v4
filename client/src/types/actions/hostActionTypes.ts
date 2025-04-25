import {
  CONNECT_ERROR,
  CONNECTED,
  CONNECTING,
  DELETE_HOST,
  DISCONNECT_FROM_DATABASE,
  CONNECT_TO_DATABASE,
  LOGGED_IN,
  LOGGED_OUT,
  PSQL_VERSION,
  UPDATE_HOST,
  PSQL_RESERVED_KEYWORDS,
} from '../../actions/hostActions';
import { ReservedKeywordType } from '../hostTypes';

export interface UpdateHostAction {
  type: typeof UPDATE_HOST;
  payload: {
    user: string;
    password: string;
    database: string;
  };
}

export interface ConnectToDatabaseAction {
  type: typeof CONNECT_TO_DATABASE;
  payload: {
    database: string;
  };
}

export interface DeleteHostAction {
  type: typeof DELETE_HOST;
  // no payload
}

export interface DisconnectFromDatabaseAction {
  type: typeof DISCONNECT_FROM_DATABASE;
  // no payload
}

export interface ConnectErrorAction {
  type: typeof CONNECT_ERROR;
  payload: string; // Could be an error message
}

export interface ConnectedAction {
  type: typeof CONNECTED;
  // no payload
}

export interface ConnectingAction {
  type: typeof CONNECTING;
  // no payload
}

export interface LoggedInAction {
  type: typeof LOGGED_IN;
  // no payload
}

export interface LoggedOutAction {
  type: typeof LOGGED_OUT;
  // no payload
}

export interface PsqlVersionAction {
  type: typeof PSQL_VERSION;
  payload: string;
}

export interface PsqlReservedKeywordsAction {
  type: typeof PSQL_RESERVED_KEYWORDS;
  payload: ReservedKeywordType[];
}

export type HostActions =
  | UpdateHostAction
  | DeleteHostAction
  | DisconnectFromDatabaseAction
  | ConnectErrorAction
  | ConnectedAction
  | ConnectingAction
  | LoggedInAction
  | LoggedOutAction
  | ConnectToDatabaseAction
  | PsqlReservedKeywordsAction
  | PsqlVersionAction;
