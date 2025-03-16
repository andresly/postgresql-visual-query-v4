import {
  CONNECT_ERROR,
  CONNECTED,
  CONNECTING,
  DELETE_HOST,
  DISCONNECT_FROM_DATABASE,
  LOGGED_IN,
  LOGGED_OUT,
  PSQL_VERSION,
  UPDATE_HOST,
} from '../../actions/hostActions';

export interface UpdateHostAction {
  type: typeof UPDATE_HOST;
  payload: {
    user: string;
    password: string;
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

export type HostActions =
  | UpdateHostAction
  | DeleteHostAction
  | DisconnectFromDatabaseAction
  | ConnectErrorAction
  | ConnectedAction
  | ConnectingAction
  | LoggedInAction
  | LoggedOutAction
  | PsqlVersionAction;
