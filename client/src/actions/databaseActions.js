import axios from 'axios';
import axiosClient from '../utils/axiosClient';
import { LOGGED_IN } from './hostActions';

export const ADD_TABLES = 'ADD_TABLES';
export const ADD_COLUMNS = 'ADD_COLUMNS';
export const ADD_CONSTRAINTS = 'ADD_CONSTRAINTS';
export const CHANGE_SELECTED_SCHEMA = 'CHANGE_SELECTED_SCHEMA';
export const UPDATE_SEARCH_EXPR = 'UPDATE_SEARCH_EXPR';
export const DELETE_DATABASE = 'DELETE_DATABASE';
export const UPDATE_HOST = 'UPDATE_HOST';
export const CONNECT_ERROR = 'CONNECT_ERROR';
export const CONNECTED = 'CONNECTED';
export const CONNECTING = 'CONNECTING';
export const ADD_DATABASES = 'ADD_DATABASES';

export const connectToDatabase = (state) => async (dispatch) => {
  dispatch({ type: CONNECTING });

  const hostInfo = {
    database: state.database,
  };

  console.log('hostInfo', hostInfo);

  axios
    .all([
      axiosClient.post('/database/tables', hostInfo),
      axiosClient.post('/database/columns', hostInfo),
      axiosClient.post('/database/constraints', hostInfo),
    ])
    .then(
      axios.spread((tables, columns, constraints) => {
        dispatch({ type: ADD_TABLES, payload: tables.data.rows });
        dispatch({ type: ADD_COLUMNS, payload: columns.data.rows });
        dispatch({ type: ADD_CONSTRAINTS, payload: constraints.data.rows });
        dispatch({ type: CONNECTED });
        dispatch({ type: UPDATE_HOST, payload: hostInfo });
      }),
    )
    .catch((error) => {
      dispatch({ type: CONNECT_ERROR, payload: error.toString() });
    });
};

export const changeSelectedSchema = (schema) => ({ type: CHANGE_SELECTED_SCHEMA, payload: schema });

export const search = (expr) => ({ type: UPDATE_SEARCH_EXPR, payload: expr });

export const fetchAvailableDatabases = (state) => async (dispatch) => {
  try {
    console.log('fetchAvailableDatabases', state);
    const data = {
      user: state.user,
      password: state.password,
    };
    const response = await axiosClient.post('/database/databases', data);
    if (response.data.rows.length > 0) {
      dispatch({ type: LOGGED_IN });
      dispatch({ type: UPDATE_HOST, payload: data });
      const availableDatabases = response.data.rows.map((row) => row.Name);
      dispatch({ type: ADD_DATABASES, payload: availableDatabases });
    }
    return response.data;
  } catch (error) {
    console.log('error', error);
    dispatch({ type: CONNECT_ERROR, payload: error.toString() });
    // throw error;
    return error.toString();
  }
};

export const logIn = (state) => async (dispatch) => {
  try {
    const data = {
      user: state.user,
      password: state.password,
    };
    const response = await axiosClient.post('/database/login', data);
    if (response.data.connected) {
      dispatch({ type: UPDATE_HOST, payload: data });
      dispatch({ type: LOGGED_IN });
    }
    return response.data;
  } catch (error) {
    console.log('error', error);
    // dispatch({ type: CONNECT_ERROR, payload: error.toString() });
    // throw error;
    dispatch({ type: CONNECT_ERROR, payload: error.toString() });

    return error.toString();
  }
};
