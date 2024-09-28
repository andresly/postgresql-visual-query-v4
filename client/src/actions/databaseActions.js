import axios from 'axios';
import axiosClient from '../utils/axiosClient';

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
