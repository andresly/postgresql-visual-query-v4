import axiosClient from '../utils/axiosClient';
import { Dispatch } from 'redux';
import { CLOSE_ALL_TABLE_VIEWS } from './tableViewActions';

export const DELETE_QUERY = 'DELETE_QUERY';
export const DELETE_QUERIES = 'DELETE_QUERIES';
export const DELETE_HOST = 'DELETE_HOST';
export const UPDATE_HOST = 'UPDATE_HOST';
export const CONNECT_ERROR = 'CONNECT_ERROR';
export const CONNECTED = 'CONNECTED';
export const LOGGED_IN = 'LOGGED_IN';
export const LOGGED_OUT = 'LOGGED_OUT';
export const CONNECTING = 'CONNECTING';
export const DELETE_DATABASE = 'DELETE_DATABASE';
export const DISCONNECT_FROM_DATABASE = 'DISCONNECT_FROM_DATABASE';
export const PSQL_VERSION = 'PSQL_VERSION';
export const CONNECT_TO_DATABASE = 'CONNECT_TO_DATABASE';

interface DatabaseState {
  user: string;
  password: string;
}

export const disconnect =
  () =>
  (dispatch: Dispatch): void => {
    dispatch({ type: DELETE_QUERY });
    dispatch({ type: DELETE_DATABASE });
    dispatch({ type: DELETE_QUERIES });
    dispatch({ type: DISCONNECT_FROM_DATABASE });
    dispatch({ type: CLOSE_ALL_TABLE_VIEWS });
  };

export const logout =
  () =>
  (dispatch: Dispatch): void => {
    dispatch({ type: DELETE_QUERY });
    dispatch({ type: DELETE_DATABASE });
    dispatch({ type: DELETE_QUERIES });
    dispatch({ type: DELETE_HOST });
    dispatch({ type: LOGGED_OUT });
  };

export const getDatabaseVersion =
  (state: DatabaseState) =>
  async (dispatch: Dispatch): Promise<void> => {
    const data = {
      user: state.user,
      password: state.password,
    };
    const response = await axiosClient.post('/database/version', data);
    if (response.data) {
      dispatch({ type: PSQL_VERSION, payload: response.data.version });
    }
  };

export const connectToDatabase =
  (database: string) =>
  (dispatch: Dispatch): void => {
    dispatch({ type: CONNECT_TO_DATABASE, payload: { database } }); // Update the database in the host reducer
  };
