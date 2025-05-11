import { QueryTableType } from '../types/queryTypes';
import { Dispatch } from 'redux';
import axiosClient from '../utils/axiosClient';
import { ThunkAction } from 'redux-thunk';
import { RootState } from '../store';

export const OPEN_TABLE_VIEW = 'OPEN_TABLE_VIEW';
export const CLOSE_TABLE_VIEW = 'CLOSE_TABLE_VIEW';
export const SET_ACTIVE_TABLE_VIEW = 'SET_ACTIVE_TABLE_VIEW';
export const FETCH_TABLE_DATA = 'FETCH_TABLE_DATA';
export const FETCH_TABLE_DATA_FULFILLED = 'FETCH_TABLE_DATA_FULFILLED';
export const FETCH_TABLE_DATA_REJECTED = 'FETCH_TABLE_DATA_REJECTED';
export const FETCH_TABLE_COUNT = 'FETCH_TABLE_COUNT';
export const FETCH_TABLE_COUNT_FULFILLED = 'FETCH_TABLE_COUNT_FULFILLED';
export const FETCH_TABLE_COUNT_REJECTED = 'FETCH_TABLE_COUNT_REJECTED';
export const CLOSE_ALL_TABLE_VIEWS = 'CLOSE_ALL_TABLE_VIEWS';

export const openTableView = (table: QueryTableType) => ({
  type: OPEN_TABLE_VIEW,
  payload: table,
});

export const closeTableView = (id: number) => ({
  type: CLOSE_TABLE_VIEW,
  payload: { id },
});

export const setActiveTableView = (id: number | null) => ({
  type: SET_ACTIVE_TABLE_VIEW,
  payload: { id },
});

export const closeAllTableViews = () => ({
  type: CLOSE_ALL_TABLE_VIEWS,
});

// Helper function to extract serializable error properties
const serializeError = (error: any) => {
  if (!error) return { message: 'Unknown error' };

  return {
    message: error.message || 'Unknown error',
    code: error.code,
    status: error.response?.status,
    statusText: error.response?.statusText,
    data: error.response?.data,
  };
};

export const fetchTableCount = (
  tableName: string,
  tableSchema: string,
  connectionDetails: any,
  whereClause?: string,
): ThunkAction<void, RootState, unknown, any> => {
  return async (dispatch: Dispatch) => {
    try {
      dispatch({ type: FETCH_TABLE_COUNT });

      // Construct SQL query to get count
      let sql = `SELECT COUNT(*) as total_count FROM "${tableSchema}"."${tableName}"`;

      // Add WHERE clause if provided
      if (whereClause && whereClause.trim() !== '') {
        sql += ` WHERE ${whereClause}`;
      }

      const data = {
        database: connectionDetails.database,
        user: connectionDetails.user,
        password: connectionDetails.password,
        sql,
      };
      const response = await axiosClient.post('/query/query', data);

      const count = response.data.rows[0].total_count;
      dispatch({ type: FETCH_TABLE_COUNT_FULFILLED, payload: count });
    } catch (error) {
      // Serialize the error before dispatching
      dispatch({ type: FETCH_TABLE_COUNT_REJECTED, payload: serializeError(error) });
    }
  };
};

export const fetchTableData = (
  tableName: string,
  tableSchema: string,
  connectionDetails: any,
  page = 0,
  pageSize = 20,
  whereClause?: string,
): ThunkAction<void, RootState, unknown, any> => {
  return async (dispatch: Dispatch) => {
    try {
      dispatch({ type: FETCH_TABLE_DATA });

      // Construct SQL query with pagination to limit payload size
      const offset = page * pageSize;
      let sql = `SELECT * FROM "${tableSchema}"."${tableName}"`;

      // Add WHERE clause if provided
      if (whereClause && whereClause.trim() !== '') {
        sql += ` WHERE ${whereClause}`;
      }

      sql += ` LIMIT ${pageSize} OFFSET ${offset}`;

      const response = await axiosClient.post('/query/query', {
        database: connectionDetails.database,
        user: connectionDetails.user,
        password: connectionDetails.password,
        sql,
      });

      dispatch({ type: FETCH_TABLE_DATA_FULFILLED, payload: response.data });
    } catch (error) {
      // Serialize the error before dispatching
      dispatch({ type: FETCH_TABLE_DATA_REJECTED, payload: serializeError(error) });
    }
  };
};
