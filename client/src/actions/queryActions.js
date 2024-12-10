import axiosClient from '../utils/axiosClient';

export const ADD_COLUMN = 'ADD_COLUMN';
export const GENERATE_SQL = 'GENERATE_SQL';
export const SWITCH_DISTINCT = 'SWITCH_DISTINCT';
export const SWITCH_RETURNING = 'SWITCH_RETURNING';
export const SWITCH_FROM_QUERY = 'SWITCH_FROM_QUERY';
export const UPDATE_FROM_QUERY = 'UPDATE_FROM_QUERY';
export const ADD_TABLE = 'ADD_TABLE';
export const ADD_ROWS = 'ADD_ROWS';
export const REMOVE_ROWS = 'REMOVE_ROWS';
export const CHANGE_QUERY_TYPE = 'CHANGE_QUERY_TYPE';
export const REMOVE_TABLE = 'REMOVE_TABLE';
export const UPDATE_COLUMN = 'UPDATE_COLUMN';
export const UPDATE_COLUMNS_ORDER = 'UPDATE_COLUMNS_ORDER';
export const UPDATE_TABLE = 'UPDATE_TABLE';
export const UPDATE_JOINS_ORDER = 'UPDATE_JOINS_ORDER';
export const ADD_RESULT = 'ADD_RESULT';
export const ADD_JOIN = 'ADD_JOIN';
export const UPDATE_JOIN = 'UPDATE_JOIN';
export const UPDATE_JOIN_NEW_TABLE = 'UPDATE_JOIN_NEW_TABLE';
export const REMOVE_JOIN = 'REMOVE_JOIN';
export const ADD_USING = 'ADD_USING';
export const UPDATE_USING = 'UPDATE_USING';
export const REMOVE_USING = 'REMOVE_USING';
export const REMOVE_COLUMN = 'REMOVE_COLUMN';
export const DELETE_QUERY = 'DELETE_QUERY';
export const RESET_QUERY = 'RESET_QUERY';
export const QUERYING = 'QUERYING';
export const UPDATE_COLUMN_OPERAND = 'UPDATE_COLUMN_OPERAND';
export const UPDATE_SQL = 'UPDATE_SQL';
export const SET_ACTIVE_QUERY = 'SET_ACTIVE_QUERY';
export const SWITCH_LIMIT = 'SWITCH_LIMIT';
export const SWITCH_TIES = 'SWITCH_TIES';
export const SET_LIMIT_VALUE = 'SET_LIMIT_VALUE';
export const ADD_SET = 'ADD_SET';
export const UPDATE_SET = 'UPDATE_SET';
export const REMOVE_SET = 'REMOVE_SET';
export const UPDATE_SETS_ORDER = 'UPDATE_SETS_ORDER';
export const UPDATE_VALIDITY = 'UPDATE_VALIDITY';
export const CHANGE_DEFAULT_VALUE = 'CHANGE_DEFAULT_VALUE';
export const ADD_FILTER_ROW = 'ADD_FILTER_ROW';
export const REMOVE_FILTER_ROW = 'REMOVE_FILTER_ROW';
export const UPDATE_COLUMN_FILTER = 'UPDATE_COLUMN_FILTER';

export const addColumn = (data) => (dispatch) => {
  dispatch({ type: ADD_COLUMN, payload: data });
  dispatch({ type: GENERATE_SQL });
};

export const addRows = () => (dispatch) => {
  dispatch({ type: ADD_ROWS });
  dispatch({ type: GENERATE_SQL });
};

export const removeRows = () => (dispatch) => {
  dispatch({ type: REMOVE_ROWS });
  dispatch({ type: GENERATE_SQL });
};

export const addFilterRow = () => (dispatch) => {
  dispatch({ type: ADD_FILTER_ROW });
  dispatch({ type: GENERATE_SQL });
};

export const removeFilterRow = () => (dispatch) => {
  dispatch({ type: REMOVE_FILTER_ROW });
  dispatch({ type: GENERATE_SQL });
};

export const updateColumnFilter = (data) => (dispatch) => {
  dispatch({ type: UPDATE_COLUMN_FILTER, payload: data });
  dispatch({ type: GENERATE_SQL });
};

export const switchDistinct = () => (dispatch) => {
  dispatch({ type: SWITCH_DISTINCT });
  dispatch({ type: GENERATE_SQL });
};

export const switchReturning = () => (dispatch) => {
  dispatch({ type: SWITCH_RETURNING });
  dispatch({ type: GENERATE_SQL });
};

export const switchFromQuery = () => (dispatch) => {
  dispatch({ type: SWITCH_FROM_QUERY });
  dispatch({ type: GENERATE_SQL });
};

export const updateFromQuery = (data) => (dispatch) => {
  dispatch({ type: UPDATE_FROM_QUERY, payload: data });
  dispatch({ type: GENERATE_SQL });
};

export const changeQueryType = (data) => (dispatch) => {
  dispatch({ type: CHANGE_QUERY_TYPE, payload: data });
};

export const changeDefaultValue = (data) => (dispatch) => {
  dispatch({ type: CHANGE_DEFAULT_VALUE, payload: data });
  dispatch({ type: GENERATE_SQL });
};

export const addTable = (data) => (dispatch) => {
  dispatch({ type: ADD_TABLE, payload: data });
  dispatch({ type: GENERATE_SQL });
};

export const removeTable = (data) => (dispatch) => {
  dispatch({ type: REMOVE_TABLE, payload: data });
  dispatch({ type: GENERATE_SQL });
};

export const updateColumn = (data) => (dispatch) => {
  dispatch({ type: UPDATE_COLUMN, payload: data });
  dispatch({ type: GENERATE_SQL });
};

export const updateColumnOperand = (operand, id) => (dispatch) => {
  dispatch({ type: UPDATE_COLUMN_OPERAND, payload: { operand, id } });
  dispatch({ type: GENERATE_SQL });
};

export const updateColumnsOrder = (data) => (dispatch) => {
  dispatch({ type: UPDATE_COLUMNS_ORDER, payload: data });
  dispatch({ type: GENERATE_SQL });
};

export const updateTable = (data) => (dispatch) => {
  dispatch({ type: UPDATE_TABLE, payload: data });
  dispatch({ type: GENERATE_SQL });
};

export const updateJoinsOrder = (data) => (dispatch) => {
  dispatch({ type: UPDATE_JOINS_ORDER, payload: data });
  dispatch({ type: GENERATE_SQL });
};

export const queryAction = (state) => ({
  type: ADD_RESULT,
  payload: axiosClient.post('/query/query', {
    database: state.database,
    user: state.user,
    password: state.password,
    sql: state.sql,
  }),
});

export const query = (state) => async (dispatch) => {
  try {
    dispatch({ type: QUERYING });
    await dispatch(queryAction(state));
  } catch (error) {
    dispatch({ type: `${ADD_RESULT}_REJECTED`, payload: error });
  }
};

export const addJoin =
  (join, isDragAndDrop = false) =>
  (dispatch) => {
    dispatch({
      type: ADD_JOIN,
      payload: {
        join,
        isDragAndDrop,
      },
    });
    dispatch({ type: GENERATE_SQL });
  };

export const updateJoin = (data) => (dispatch) => {
  dispatch({ type: UPDATE_JOIN, payload: data });
  dispatch({ type: GENERATE_SQL });
};

export const updateJoinNewTable = (data) => (dispatch) => {
  dispatch({ type: UPDATE_JOIN_NEW_TABLE, payload: data });
  dispatch({ type: GENERATE_SQL });
};

export const removeJoin = (data) => (dispatch) => {
  dispatch({ type: REMOVE_JOIN, payload: data });
  dispatch({ type: GENERATE_SQL });
};

export const addUsing = () => ({ type: ADD_USING });

export const updateUsing = (data) => (dispatch) => {
  dispatch({ type: UPDATE_USING, payload: data });
  dispatch({ type: GENERATE_SQL });
};

export const removeUsing = (data) => (dispatch) => {
  dispatch({ type: REMOVE_USING, payload: data });
  dispatch({ type: GENERATE_SQL });
};

export const removeColumn = (data) => (dispatch) => {
  dispatch({ type: REMOVE_COLUMN, payload: data });
  dispatch({ type: GENERATE_SQL });
};

export const deleteQuery = () => ({ type: DELETE_QUERY });

export const resetQuery = (data) => (dispatch) => {
  dispatch({ type: RESET_QUERY, payload: data });
};

export const updateSql = (sqlString) => ({ type: UPDATE_SQL, payload: { sqlString } });

export const setActiveQuery = (data) => ({ type: SET_ACTIVE_QUERY, payload: data });

export const switchLimit = () => (dispatch) => {
  dispatch({ type: SWITCH_LIMIT });
  dispatch({ type: GENERATE_SQL });
};

export const switchTies = () => (dispatch) => {
  dispatch({ type: SWITCH_TIES });
  dispatch({ type: GENERATE_SQL });
};

export const setLimitValue = (limitValue) => (dispatch) => {
  dispatch({ type: SET_LIMIT_VALUE, payload: { limitValue } });
  dispatch({ type: GENERATE_SQL });
};

export const updateValidity = (isValid) => ({ type: UPDATE_VALIDITY, payload: { isValid } });

export const addSet = () => ({ type: ADD_SET });

export const updateSet = (data) => (dispatch) => {
  dispatch({ type: UPDATE_SET, payload: data });
  dispatch({ type: GENERATE_SQL });
};

export const removeSet = (data) => (dispatch) => {
  dispatch({ type: REMOVE_SET, payload: data });
  dispatch({ type: GENERATE_SQL });
};

export const updateSetsOrder = (data) => (dispatch) => {
  dispatch({ type: UPDATE_SETS_ORDER, payload: data });
  dispatch({ type: GENERATE_SQL });
};
